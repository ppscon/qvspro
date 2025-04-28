import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import SignOutButton from '../../components/SignOutButton';
import QvsLogo from '../../components/ui/QvsLogo';

const QuantumEducationHub: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { getDisplayName } = useAuth();
  const displayName = getDisplayName();
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <header className="bg-gray-800 text-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <QvsLogo className="logo-qvs" alt="QVS-Pro Logo" />
            </Link>
            <h1 className="ml-4 text-2xl font-semibold">Quantum Education Hub</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-gray-300">Home</Link>
            <Link to="/app" className="text-white hover:text-gray-300">Scanner</Link>
            <Link to="/dashboard" className="text-white hover:text-gray-300">Dashboard</Link>
            <Link to="/profile" className="text-white hover:text-gray-300">Profile</Link>
            
            <div className="flex items-center text-white hover:text-gray-300 mr-2">
              <FiUser className="mr-1" /> {displayName}
            </div>
            
            <SignOutButton className="text-white hover:text-gray-300" />
          </div>
        </div>
      </header>
    </div>
  );
};

export default QuantumEducationHub; 