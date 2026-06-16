-- =========================================================================
-- ASAS RE-OS: Advanced User Invitation & Onboarding Logic
-- =========================================================================

-- 1. Automatic Profile Creation on Signup (Trigger)
-- This creates a "shell" profile when a user signs up. The agency_id will be NULL
-- until they complete Onboarding or Accept an Invite.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, role, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        'agent',
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (to allow safely re-running script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create Trigger mapped to auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Secure App-Level Function to Accept Invite (Stored Procedure)
-- This ensures atomicity when a user clicks an invite link.
CREATE OR REPLACE FUNCTION public.accept_invite(_token VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_invite_record RECORD;
    v_user_profile RECORD;
BEGIN
    -- Validate token
    SELECT * INTO v_invite_record FROM public.invites WHERE token = _token AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invite token.';
    END IF;

    -- Ensure current user exists in profiles (created by the trigger)
    SELECT * INTO v_user_profile FROM public.profiles WHERE id = auth.uid();
    
    IF NOT FOUND THEN
         RAISE EXCEPTION 'User profile not found. Please complete signup first.';
    END IF;

    -- If user is already associated with an agency, reject
    IF v_user_profile.agency_id IS NOT NULL THEN
         RAISE EXCEPTION 'You are already associated with an agency. You cannot join another one.';
    END IF;

    -- Update Profile with Agency from Invite
    UPDATE public.profiles
    SET agency_id = v_invite_record.agency_id,
        role = v_invite_record.role,
        updated_at = NOW()
    WHERE id = auth.uid();

    -- Mark Invite as Accepted
    UPDATE public.invites
    SET status = 'accepted',
        updated_at = NOW()
    WHERE id = v_invite_record.id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Allow authenticated users to call accept_invite
GRANT EXECUTE ON FUNCTION public.accept_invite(VARCHAR) TO authenticated;


-- 4. Add Status and Email columns to profiles if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 5. Trigger to prevent Self-Escalation of Role
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- If the role is being changed
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Allow the change if the user changing it is an owner/manager applying it to SOMEONE ELSE
        -- But prevent self-escalation (a user escalating their own role from agent to manager/owner)
        IF auth.uid() = NEW.id AND OLD.role NOT IN ('owner', 'manager') AND NEW.role IN ('owner', 'manager') THEN
            RAISE EXCEPTION 'You cannot escalate your own role.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;
CREATE TRIGGER on_profile_role_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();


-- 3. Atomic Agency Creation Function (Used in Onboarding)
CREATE OR REPLACE FUNCTION public.create_agency_and_link_owner(
    _agency_name VARCHAR,
    _agency_phone VARCHAR,
    _user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_agency_id UUID;
    v_profile RECORD;
BEGIN
    -- Security check: ensure the caller is modifying their own profile
    IF auth.uid() != _user_id THEN
        RAISE EXCEPTION 'Unauthorized operation.';
    END IF;

    -- Check if user already has an agency
    SELECT * INTO v_profile FROM public.profiles WHERE id = _user_id;
    
    IF v_profile.agency_id IS NOT NULL THEN
        RAISE EXCEPTION 'User is already associated with an agency.';
    END IF;

    -- Insert new agency securely
    INSERT INTO public.agencies (name, phone)
    VALUES (_agency_name, _agency_phone)
    RETURNING id INTO v_agency_id;

    -- Assign current user as owner of the new agency
    UPDATE public.profiles
    SET agency_id = v_agency_id,
        role = 'owner',
        updated_at = NOW()
    WHERE id = _user_id;

    RETURN v_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.create_agency_and_link_owner(VARCHAR, VARCHAR, UUID) TO authenticated;
