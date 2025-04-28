-- Migration for user approval workflow

-- Ensure profiles table has the required columns
DO $$
BEGIN
  -- Check and add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
  
  -- Check and add approval_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN approval_status text DEFAULT 'pending';
  END IF;
END $$;

-- Table for storing approved users
CREATE TABLE IF NOT EXISTS approved_users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  approved_at timestamptz DEFAULT now(),
  approved_by uuid REFERENCES auth.users(id)
);

-- Add RLS policies for the approved_users table
ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS admin_read_all_approved_users ON approved_users;
DROP POLICY IF EXISTS admin_insert_approved_users ON approved_users;
DROP POLICY IF EXISTS user_see_own_approval ON approved_users;

-- Create new policies
-- Policy to allow admins to see all approved users
CREATE POLICY admin_read_all_approved_users ON approved_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy to allow admins to insert approved users
CREATE POLICY admin_insert_approved_users ON approved_users 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Allow users to see if they are approved
CREATE POLICY user_see_own_approval ON approved_users 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Function to approve a user for access to the application
CREATE OR REPLACE FUNCTION approve_user(input_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists boolean;
BEGIN
  -- Check if the user exists in profiles table
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = input_user_id
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'User with ID % does not exist', input_user_id;
  END IF;
  
  -- Insert the user into the approved_users table if not already there
  INSERT INTO approved_users (user_id, approved_at, approved_by)
  VALUES (input_user_id, now(), auth.uid())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update the profile to mark as approved
  UPDATE profiles
  SET approval_status = 'approved'
  WHERE id = input_user_id;
END;
$$; 