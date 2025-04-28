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

  -- Create the approved_users table if it doesn't exist
  CREATE TABLE IF NOT EXISTS approved_users (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    approved_at timestamptz DEFAULT now(),
    approved_by uuid REFERENCES auth.users(id)
  );
  
  -- Enable RLS on approved_users table
  ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies if they exist to avoid conflicts
  DROP POLICY IF EXISTS admin_read_all_approved_users ON approved_users;
  DROP POLICY IF EXISTS admin_insert_approved_users ON approved_users;
  DROP POLICY IF EXISTS user_see_own_approval ON approved_users;
  
  -- Create policies for approved_users table
  CREATE POLICY admin_read_all_approved_users ON approved_users 
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid()
      )
    );
  
  CREATE POLICY admin_insert_approved_users ON approved_users 
    FOR INSERT 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid()
      )
    );
  
  CREATE POLICY user_see_own_approval ON approved_users 
    FOR SELECT 
    USING (user_id = auth.uid());
END $$; 