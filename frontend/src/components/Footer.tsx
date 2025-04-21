import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <Link to="/" className="flex items-center mr-4">
            <img src="/images/logo-qvs.png" alt="QVS-Pro Logo" className="logo-qvs-footer" />
          </Link>
          <div className="text-sm text-gray-400">
            <p className="inline-block">
              Quantum Vulnerability Scanner © {new Date().getFullYear()} | 
              <a href="https://qvspro.net" className="ml-1 hover:underline">qvspro.net</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 