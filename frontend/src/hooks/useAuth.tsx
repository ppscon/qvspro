import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserCredentials, UserProfile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (credentials: UserCredentials) => Promise<{ error: any | null; data: any }>;
  signIn: (credentials: UserCredentials) => Promise<{ error: any | null; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null; data: any }>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signUp: async () => ({ error: null, data: null }),
  signIn: async () => ({ error: null, data: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null, data: null }),
});

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from the database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          try {
            // Create a new profile with the user ID
            const { data: newData, error: createError } = await supabase
              .from('profiles')
              .insert({ id: userId })
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
            } else if (newData) {
              setProfile(newData);
            }
          } catch (createErr) {
            console.error('Error in profile creation process:', createErr);
          }
        }
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile function:', error);
    }
  };
  
  // Check if the user is an admin
  const checkAdminStatus = async (userId: string) => {
    try {
      // Use a more direct query approach to avoid infinite recursion
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId);
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      // User is admin if we found a matching record
      setIsAdmin(data && data.length > 0);
    } catch (error) {
      console.error('Error in checkAdminStatus function:', error);
      setIsAdmin(false);
    }
  };

  // Sign up a new user
  const signUp = async ({ email, password, profile_name }: UserCredentials) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            profile_name
          }
        }
      });

      // Create profile when user signs up
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: data.user.id,
            profile_name,
            username: profile_name // Set username to profile_name initially for backward compatibility
          }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  // Sign in existing user
  const signIn = async ({ email, password }: UserCredentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      return { data, error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 