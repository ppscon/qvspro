import React, { useState, useEffect } from 'react';
import { FiSave, FiLogOut, FiTrash2, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import SignOutButton from '../../components/SignOutButton';
import { Profile as ProfileComponent } from '../components/auth/Profile';
import Header from '../components/Header';

const ProfilePage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto py-8 px-4 flex-grow">
        <ProfileComponent />
      </main>
      
      <SignOutButton />
    </div>
  );
};

export default ProfilePage; 