import React from 'react';
import { Auth } from '../components/auth/Auth';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-qvs.png" 
          alt="Quantum Computing" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="py-8">
          <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300">
            <FiArrowLeft className="mr-2" /> Back to Home
          </Link>
        </div>
        
        <div className="py-8">
          <Auth redirectTo="/app" />
        </div>
      </div>
    </div>
  );
};

export default Login; 