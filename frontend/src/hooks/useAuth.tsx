import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserCredentials, UserProfile } from '../types';
import { ensureUserProfile, checkUserApproval } from './useProfileHelper';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  getDisplayName: () => string;
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
  isApproved: false,
  getDisplayName: () => 'User',
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
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdminStatus(session.user.id);
        checkApprovalStatus(session.user.id);
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
        checkApprovalStatus(session.user.id);
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
          // Get user's email from auth
          const { data: userData } = await supabase.auth.getUser();
          const email = userData?.user?.email;
          
          // Create profile using our helper
          const profileCreated = await ensureUserProfile(
            userId, 
            email || undefined,
            userData?.user?.user_metadata?.profile_name
          );
          
          if (profileCreated) {
            // Re-fetch the profile
            const { data: newData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
              
            if (newData) {
              setProfile(newData);
            }
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

  // Check if the user is approved
  const checkApprovalStatus = async (userId: string) => {
    // Use our helper function
    const isUserApproved = await checkUserApproval(userId);
    setIsApproved(isUserApproved);
    
    // If admin, automatically approve
    if (isAdmin) {
      setIsApproved(true);
    }
  };

  // Sign up a new user
  const signUp = async ({ email, password, profile_name }: UserCredentials) => {
    try {
      // First, sign up the user with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            profile_name
          }
        }
      });

      if (error) {
        console.error('Error signing up:', error);
        return { data: null, error };
      }

      // Only try to create profile if user was created successfully
      if (data.user) {
        try {
          // Use our helper function
          await ensureUserProfile(data.user.id, email, profile_name);
        } catch (profileErr) {
          console.error('Exception in profile creation:', profileErr);
          // Don't fail the signup if profile creation throws an exception
        }
      }

      return { data, error: null };
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

  // Add a helper method to get a consistent display name
  const getDisplayName = () => {
    if (!user) return 'User';
    
    // Priority order: profile.username, user.user_metadata.profile_name, email username
    return profile?.username || user.user_metadata?.profile_name || user.email?.split('@')[0] || 'User';
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isAdmin,
    isApproved,
    getDisplayName,
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