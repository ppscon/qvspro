import React, { useState, useEffect } from 'react';
import { FiUser, FiSave, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';

export const Profile: React.FC = () => {
  const { user, profile: authProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: '',
    full_name: '',
    avatar_url: '',
    company: '',
    job_title: '',
    website: '',
  });

  // Initialize profile state with existing data
  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile);
    }
  }, [authProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const updates = {
        id: user.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        company: profile.company,
        job_title: profile.job_title,
        website: profile.website,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      setMessage({
        text: 'Profile updated successfully!',
        type: 'success',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({
        text: error.message || 'Error updating profile',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Profile</h2>
        
        {message && (
          <div className={`p-4 mb-4 text-sm rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-200' 
              : 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200'
          }`}>
            {message.type === 'success' ? (
              <FiCheck className="mr-2 flex-shrink-0" />
            ) : (
              <FiAlertCircle className="mr-2 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={profile.username || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={profile.full_name || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company
              </label>
              <div className="mt-1">
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={profile.company || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Title
              </label>
              <div className="mt-1">
                <input
                  id="job_title"
                  name="job_title"
                  type="text"
                  value={profile.job_title || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Website
              </label>
              <div className="mt-1">
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={profile.website || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Avatar URL
              </label>
              <div className="mt-1">
                <input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  value={profile.avatar_url || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <FiSave className="mr-2" />
                  Save Profile
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 