-- Add missing columns to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Create indexes for common lookup fields
CREATE INDEX IF NOT EXISTS profiles_website_idx ON public.profiles (website);
CREATE INDEX IF NOT EXISTS profiles_company_idx ON public.profiles (company); 