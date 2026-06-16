-- Fix handling of new user signup: populate full_name correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    extracted_full_name TEXT;
BEGIN
    -- Determine full name from metadata
    extracted_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')),
        'User'
    );

    INSERT INTO public.profiles (id, first_name, last_name, full_name, role, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        extracted_full_name,
        'agent',
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
