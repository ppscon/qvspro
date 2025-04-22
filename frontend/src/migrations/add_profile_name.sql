-- Add profile_name column to auth.users table
ALTER TABLE auth.users ADD COLUMN profile_name TEXT;

-- Create a trigger function to ensure profile_name is set
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, profile_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'profile_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure profile_name is part of the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_name TEXT;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_profile_name_idx ON public.profiles (profile_name); 