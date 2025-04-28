-- Table for storing approved users
CREATE TABLE IF NOT EXISTS approved_users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  approved_at timestamptz DEFAULT now(),
  approved_by uuid REFERENCES auth.users(id)
);

-- Update profiles table to add approval_status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN approval_status text DEFAULT 'pending';
  END IF;
END $$;

-- Add RLS policies for the approved_users table
ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;

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