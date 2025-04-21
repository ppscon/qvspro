import React, { useState } from 'react';
import { Profile as ProfileComponent } from '../components/auth/Profile';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
      
      <Footer />
    </div>
  );
};

export default ProfilePage; 