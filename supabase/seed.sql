-- Seed file for ASAS ERP / ORCAL
-- This file populates the database with test data for various roles.
-- RUN THIS IN SUPABASE SQL EDITOR OR LOCALLY VIA CLI.

-- 1. Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create a test agency
INSERT INTO public.agencies (id, name, phone, email)
VALUES ('A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1', 'Orcal Main Agency', '+213700000000', 'contact@orcal.com')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Function to insert or update user securely
CREATE OR REPLACE FUNCTION public.seed_user(
    p_id UUID,
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_role TEXT,
    p_agency_id UUID
) RETURNS VOID AS $$
BEGIN
    -- Insert into auth.users safely
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_id) THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
            last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000', 
            p_id, 
            'authenticated', 
            'authenticated', 
            p_email, 
            crypt('password123', gen_salt('bf')), 
            now(), 
            now(), 
            '{"provider":"email","providers":["email"]}', 
            json_build_object('first_name', p_first_name, 'last_name', p_last_name), 
            now(), 
            now()
        );
    END IF;

    -- Insert into auth.identities safely
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE provider_id = p_id::TEXT AND provider = 'email') THEN
        INSERT INTO auth.identities (
            id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        )
        VALUES (
            p_id, p_id, p_id::TEXT, json_build_object('sub', p_id::TEXT, 'email', p_email), 'email', now(), now(), now()
        );
    END IF;

    -- The trigger `handle_new_user` has created a profile with role='agent'. 
    -- Now we synchronize the profile side.
    UPDATE public.profiles
    SET role = p_role,
        agency_id = p_agency_id,
        email = p_email,
        first_name = p_first_name,
        last_name = p_last_name,
        full_name = p_first_name || ' ' || p_last_name
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Create test users for each role (Password is always password123)

-- Owner (Admin)
SELECT public.seed_user('B2B2B2B2-B2B2-4B2B-B2B2-B2B2B2B2B2B1', 'admin@orcal.com', 'Ahmed', 'Admin', 'owner', 'A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1');

-- Manager
SELECT public.seed_user('B2B2B2B2-B2B2-4B2B-B2B2-B2B2B2B2B2B2', 'manager@orcal.com', 'Karim', 'Manager', 'manager', 'A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1');

-- Agent
SELECT public.seed_user('B2B2B2B2-B2B2-4B2B-B2B2-B2B2B2B2B2B3', 'agent@orcal.com', 'Amine', 'Agent', 'agent', 'A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1');

-- Promoter / Merqui
SELECT public.seed_user('B2B2B2B2-B2B2-4B2B-B2B2-B2B2B2B2B2B4', 'promoter@orcal.com', 'Youssef', 'Promoter', 'promoter', 'A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1');

-- Accountant
SELECT public.seed_user('B2B2B2B2-B2B2-4B2B-B2B2-B2B2B2B2B2B5', 'accountant@orcal.com', 'Fatima', 'Accountant', 'accountant', 'A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1');

-- Marketer
SELECT public.seed_user('B2B2B2B2-B2B2-4B2B-B2B2-B2B2B2B2B2B6', 'marketer@orcal.com', 'Sarah', 'Marketer', 'marketer', 'A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1');

-- Drop helper function
DROP FUNCTION public.seed_user(UUID, TEXT, TEXT, TEXT, TEXT, UUID);


-- 4. Projects & Units
INSERT INTO public.projects (id, agency_id, name, description, location, status, budget)
VALUES 
    ('C3C3C3C3-C3C3-4C3C-C3C3-C3C3C3C3C3C1', 'A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1', 'Résidence Les Jasmins', 'Projet résidentiel haut standing', 'Alger', 'active', 500000000),
    ('C3C3C3C3-C3C3-4C3C-C3C3-C3C3C3C3C3C2', 'A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1', 'Tour ORCAL', 'Bureaux professionnels', 'Oran', 'planning', 1200000000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.units (id, project_id, unit_number, type, surface_area, floor_level, base_price, status)
VALUES
    ('D4D4D4D4-D4D4-4D4D-D4D4-D4D4D4D4D4D1', 'C3C3C3C3-C3C3-4C3C-C3C3-C3C3C3C3C3C1', 'A-01', 'F3', 85.5, 1, 15000000, 'available'),
    ('D4D4D4D4-D4D4-4D4D-D4D4-D4D4D4D4D4D2', 'C3C3C3C3-C3C3-4C3C-C3C3-C3C3C3C3C3C1', 'B-12', 'F4', 110.0, 3, 21000000, 'reserved'),
    ('D4D4D4D4-D4D4-4D4D-D4D4-D4D4D4D4D4D3', 'C3C3C3C3-C3C3-4C3C-C3C3-C3C3C3C3C3C2', 'BUREAU-1', 'Commercial', 150.0, 1, 45000000, 'available')
ON CONFLICT (id) DO NOTHING;

-- 5. Clients
INSERT INTO public.clients (id, agency_id, first_name, last_name, email, phone, identity_document_type, identity_document_number, address)
VALUES
    ('E5E5E5E5-E5E5-4E5E-E5E5-E5E5E5E5E5E1', 'A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1', 'Mohammed', 'Ali', 'mohammed.ali@example.com', '0555000111', 'CNI', '111222333', 'Alger Centre'),
    ('E5E5E5E5-E5E5-4E5E-E5E5-E5E5E5E5E5E2', 'A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1', 'Amina', 'Ben', 'amina.b@example.com', '0666000222', 'Passeport', 'P98765432', 'Oran')
ON CONFLICT (id) DO NOTHING;

-- 6. Deals (Ventes / Réservations)
INSERT INTO public.deals (id, agency_id, client_id, unit_id, assigned_to, deal_type, status, amount, discount_percentage, agreed_price)
VALUES
    ('F6F6F6F6-F6F6-4F6F-F6F6-F6F6F6F6F6F1', 'A1A1A1A1-A1A1-4A1A-A1A1-A1A1A1A1A1A1', 'E5E5E5E5-E5E5-4E5E-E5E5-E5E5E5E5E5E1', 'D4D4D4D4-D4D4-4D4D-D4D4-D4D4D4D4D4D2', 'B2B2B2B2-B2B2-4B2B-B2B2-B2B2B2B2B2B3', 'VSP', 'won', 21000000, 0, 21000000)
ON CONFLICT (id) DO NOTHING;
