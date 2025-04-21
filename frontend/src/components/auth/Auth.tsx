import React, { useState } from 'react';
import { FiMail, FiLock, FiAlertCircle, FiArrowRight, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { UserCredentials } from '../../types';

interface AuthProps {
  redirectTo?: string;
}

export const Auth: React.FC<AuthProps> = ({ redirectTo = '/app' }) => {
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'resetPassword'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileName, setProfileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signIn') {
        const { error } = await signIn({ email, password });
        if (error) throw error;
        window.location.href = redirectTo;
      } else if (mode === 'signUp') {
        if (!profileName.trim()) {
          throw new Error('Profile name is required');
        }
        const { error } = await signUp({ email, password, profile_name: profileName });
        if (error) throw error;
        setMessage('Registration successful! Please check your email to confirm your account.');
        setMode('signIn');
      } else if (mode === 'resetPassword') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setMessage('Check your email for the password reset link.');
        setMode('signIn');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {mode === 'signIn' ? 'Sign in to your account' : 
             mode === 'signUp' ? 'Create a new account' : 
             'Reset your password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {mode === 'signIn' ? "Don't have an account? " : 
             mode === 'signUp' ? 'Already have an account? ' : 
             'Remember your password? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signIn' ? 'signUp' : 'signIn');
                setError(null);
                setMessage(null);
              }}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {mode === 'signIn' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg flex items-center">
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-lg">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'signUp' && (
              <div>
                <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    id="profileName"
                    name="profileName"
                    type="text"
                    autoComplete="name"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="pl-10 block w-full py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Your full name"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {mode !== 'resetPassword' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
                    required={mode === 'signIn' || mode === 'signUp'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 block w-full py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
          </div>

          {mode === 'signIn' && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setMode('resetPassword');
                  setError(null);
                  setMessage(null);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  {mode === 'signIn' ? 'Sign in' : mode === 'signUp' ? 'Sign up' : 'Send reset link'}
                  <FiArrowRight className="ml-2" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 