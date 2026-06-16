-- Migration to ensure alignment between application models and the database schema
-- This satisfies the need to make the DB perfectly aligned with the app's needs

-- 1. Agencies (already had migration 003 for website, but adding safety check here)
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- 2. Clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'buyer';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);

-- Make first_name and last_name nullable on clients
ALTER TABLE public.clients ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.clients ALTER COLUMN last_name DROP NOT NULL;

-- 3. Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Make first_name and last_name nullable on profiles (already nullable structurally, but strictly defined)
ALTER TABLE public.profiles ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN last_name DROP NOT NULL;

-- 4. Leads (Missing columns that the frontend heavily relies heavily)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS budget_min NUMERIC;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS budget_max NUMERIC;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_agent UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cached_score NUMERIC DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS score_tier VARCHAR(50) DEFAULT 'starter';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lost_reason TEXT;

-- Leads first_name and last_name can be nullable since now we link to client_id
ALTER TABLE public.leads ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.leads ALTER COLUMN last_name DROP NOT NULL;

-- 5. Tasks (Missing title from UI code: tasks CreateTaskModal uses 'title' and 'subtitle')
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE public.tasks ALTER COLUMN description DROP NOT NULL;

-- Data synchronization: Backfill full_name where first_name and last_name exist
UPDATE public.clients SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) WHERE full_name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);
UPDATE public.profiles SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) WHERE full_name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);
