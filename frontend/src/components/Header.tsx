import React from 'react';
import { Link } from 'react-router-dom';
import { FiHelpCircle, FiSun, FiMoon, FiUser } from 'react-icons/fi';
import SignOutButton from './SignOutButton';
import QvsLogo from './ui/QvsLogo';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  darkMode?: boolean;
  toggleTheme?: () => void;
  toggleHelp?: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode = false, toggleTheme, toggleHelp }) => {
  const { getDisplayName } = useAuth();
  const displayName = getDisplayName();

  return (
    <header className="bg-gray-800 text-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <QvsLogo className="logo-qvs" alt="QVS-Pro Logo" />
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/" className="text-white hover:text-gray-300">Home</Link>
          <Link to="/app" className="text-white hover:text-gray-300">Scanner</Link>
          <Link to="/education" className="text-white hover:text-gray-300">Learn</Link>
          <Link to="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>
          <Link to="/profile" className="text-white hover:text-gray-300">Profile</Link>
          
          {toggleHelp && (
            <button 
              onClick={toggleHelp} 
              className="text-white hover:text-gray-300 flex items-center"
              aria-label="Help"
            >
              <FiHelpCircle className="mr-1" /> Help
            </button>
          )}
          
          <div className="flex items-center text-white hover:text-gray-300 mr-2">
            <FiUser className="mr-1" /> {displayName}
          </div>
          
          <SignOutButton className="text-white hover:text-gray-300" />
          
          {toggleTheme && (
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-yellow-400 hover:bg-gray-600"
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

export default Header; 