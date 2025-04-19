import React from 'react';
import { Link } from 'react-router-dom';

const EducationFooter: React.FC = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="flex items-center">
              <img src="/images/logo-qvs.png" alt="QVS-Pro Logo" className="logo-qvs-footer" style={{ height: '30px' }} />
            </Link>
          </div>
          
          <div className="text-center md:text-right text-sm text-gray-600 dark:text-gray-400">
            <p>Quantum Vulnerability Scanner © {new Date().getFullYear()}</p>
            <p>Protecting today's cryptography from tomorrow's threats</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EducationFooter; 