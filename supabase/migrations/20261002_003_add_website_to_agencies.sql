-- Add website column to agencies

ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS website VARCHAR(255);
