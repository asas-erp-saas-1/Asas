-- Schema Cleanup & Stabilization Migration
-- Ensures all columns required by the UI/seed scripts are present and intact.

-- 1. Ensure `agencies` has necessary columns
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- 2. Ensure `profiles` has `full_name`, `first_name`, `last_name`, `email`, `status`
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- 3. Fix the handle_new_user trigger to properly handle full_name, first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    extracted_full_name TEXT;
    extracted_first_name TEXT;
    extracted_last_name TEXT;
BEGIN
    -- Extract values safely from metadata
    extracted_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    extracted_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    extracted_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NULLIF(TRIM(extracted_first_name || ' ' || extracted_last_name), ''),
        'Utilisateur'
    );

    -- Insert profile safely.
    -- We use DO UPDATE to ensure if the row was created before it gets the latest data.
    INSERT INTO public.profiles (id, first_name, last_name, full_name, role, email)
    VALUES (
        NEW.id,
        extracted_first_name,
        extracted_last_name,
        extracted_full_name,
        'agent',
        NEW.email
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
