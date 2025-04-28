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
  INSERT INTO approved_users (user_id, approved_at)
  VALUES (input_user_id, now())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update the profile to mark as approved
  UPDATE profiles
  SET approval_status = 'approved'
  WHERE id = input_user_id;
END;
$$; 