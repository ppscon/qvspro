import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiSun, FiMoon, FiUser } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import SignOutButton from './SignOutButton';
import QvsLogo from './ui/QvsLogo';

interface EducationHeaderProps {
  title?: string;
  darkMode?: boolean;
  toggleTheme?: () => void;
}

const EducationHeader: React.FC<EducationHeaderProps> = ({ title, darkMode = false, toggleTheme }) => {
  const { getDisplayName } = useAuth();
  const displayName = getDisplayName();
  
  return (
    <header className="bg-gray-800 text-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <QvsLogo className="logo-qvs" alt="QVS-Pro Logo" />
          </Link>
          {title && (
            <h1 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-white hover:text-gray-300">Home</Link>
          <Link to="/app" className="text-white hover:text-gray-300">Scanner</Link>
          <Link to="/education" className="text-white hover:text-gray-300">Learn</Link>
          <Link to="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>
          <Link to="/profile" className="text-white hover:text-gray-300">Profile</Link>
          
          <div className="flex items-center text-white hover:text-gray-300 mr-2">
            <FiUser className="mr-1" /> {displayName}
          </div>
          
          <SignOutButton className="text-white hover:text-gray-300" />
          
          {toggleTheme && (
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-theme"
              aria-label="Toggle theme"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default EducationHeader; 