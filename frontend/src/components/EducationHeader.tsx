import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiSun, FiMoon } from 'react-icons/fi';

interface EducationHeaderProps {
  title?: string;
  darkMode?: boolean;
  toggleTheme?: () => void;
}

const EducationHeader: React.FC<EducationHeaderProps> = ({ title, darkMode = false, toggleTheme }) => {
  return (
    <header className="header py-4">
      <div className="container">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/images/logo-qvs.png" alt="QVS-Pro Logo" className="logo-qvs" />
            </Link>
            {title && (
              <h1 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/education" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              <FiArrowLeft className="mr-2" />
              Back to Education Hub
            </Link>
            
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
      </div>
    </header>
  );
};

export default EducationHeader; 