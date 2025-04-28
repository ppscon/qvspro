import { supabase } from '../lib/supabase';

/**
 * Helper function to ensure a user profile exists
 * Use this when encountering database errors with profile creation
 */
export const ensureUserProfile = async (userId: string, email?: string, username?: string): Promise<boolean> => {
  try {
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    // If profile exists, no need to create it
    if (existingProfile) {
      return true;
    }

    // If error is not "not found", something else went wrong
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile:', checkError);
      return false;
    }

    // Profile doesn't exist, create it with provided information
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        username: username || email?.split('@')[0] || 'user',
        approval_status: 'pending',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in ensureUserProfile:', error);
    return false;
  }
};

/**
 * Check approval status for a user directly
 */
export const checkUserApproval = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('approved_users')
      .select('user_id')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error checking approval status:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Exception in checkUserApproval:', error);
    return false;
  }
}; 