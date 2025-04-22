import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Error: Supabase environment variables are missing.\n' +
    'Please set the following in your .env file:\n' +
    '- REACT_APP_SUPABASE_URL\n' +
    '- REACT_APP_SUPABASE_ANON_KEY'
  );
}

// Create supabase client with required values (will throw error if missing)
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
); 