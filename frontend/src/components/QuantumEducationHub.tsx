import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCpu, FiActivity, FiLock, FiKey, FiFileText, FiSun, FiMoon, FiAward } from 'react-icons/fi';
import EducationFooter from './EducationFooter';

interface EducationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const EducationCard: React.FC<EducationCardProps> = ({ title, description, icon, path }) => {
  return (
    <Link to={path} className="block">
      <>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-transform duration-300 hover:transform hover:scale-105">
          <div className="flex items-center justify-center w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </>
    </Link>
  );
};

const QuantumEducationHub: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);

  // Initialize theme based on user preference
  useEffect(() => {
    // Force dark mode as default
    setDarkMode(true);
    document.documentElement.classList.add('dark');
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="header py-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/images/logo-qvs.png" alt="QVS-Pro Logo" className="logo-qvs" />
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/app" className="nav-link">
                Scanner
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                className="btn-theme"
                aria-label="Toggle theme"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Quantum Computing Education Hub</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Learn the fundamentals of quantum computing and how it impacts cryptography.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EducationCard 
              title="Shor's Algorithm Interactive Demo"
              description="Understand how quantum computers can break RSA encryption using Shor's algorithm."
              icon={<FiCpu className="w-8 h-8" />}
              path="/education/shors-algorithm"
            />
            
            <EducationCard 
              title="Quantum Bits (Qubits) Explained"
              description="Interactive visualization of quantum bits, superposition, and entanglement."
              icon={<FiActivity className="w-8 h-8" />}
              path="/education/qubits"
            />
            
            <EducationCard 
              title="Post-Quantum Cryptography"
              description="Learn about encryption that remains secure against quantum computers."
              icon={<FiLock className="w-8 h-8" />}
              path="/education/post-quantum"
            />
            
            <EducationCard 
              title="Grover's Algorithm"
              description="How quantum computing impacts symmetric cryptography and hash functions."
              icon={<FiKey className="w-8 h-8" />}
              path="/education/grovers-algorithm"
            />
            
            <EducationCard 
              title="Quantum Computing Glossary"
              description="Key terms and concepts explained for beginners to advanced users."
              icon={<FiFileText className="w-8 h-8" />}
              path="/education/glossary"
            />
            
            <EducationCard 
              title="Quantum Computing Quiz"
              description="Test your knowledge with our comprehensive quiz on quantum computing and cryptography."
              icon={<FiAward className="w-8 h-8" />}
              path="/education/quiz"
            />
          </div>
          
          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Why Quantum Computing Matters for Security</h2>
            <p className="mb-4">
              Quantum computers leverage quantum mechanical phenomena to perform computations that would be 
              practically impossible for classical computers. This poses both opportunities and threats 
              for cybersecurity:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Threat to Public Key Encryption:</strong> Shor's algorithm can efficiently factor large 
                numbers, breaking RSA and ECC cryptography.
              </li>
              <li>
                <strong>Impact on Symmetric Encryption:</strong> Grover's algorithm reduces the effective key 
                length of symmetric algorithms by half.
              </li>
              <li>
                <strong>Post-Quantum Solutions:</strong> New cryptographic algorithms designed to be secure 
                against quantum attack are being developed and standardized.
              </li>
              <li>
                <strong>Quantum Key Distribution:</strong> Quantum properties enable theoretically unhackable 
                communication channels.
              </li>
            </ul>
          </div>
        </div>
      </main>
      
      <EducationFooter />
    </div>
  );
};

export default QuantumEducationHub; 