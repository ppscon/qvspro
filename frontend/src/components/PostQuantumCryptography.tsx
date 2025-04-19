import React, { useState, useEffect } from 'react';
import { FiInfo, FiShield, FiKey, FiLock } from 'react-icons/fi';
import EducationHeader from './EducationHeader';
import EducationFooter from './EducationFooter';

interface AlgorithmCardProps {
  title: string;
  type: string;
  description: string;
  status: 'standardized' | 'finalist' | 'alternative' | 'research';
  icon: React.ReactNode;
}

const AlgorithmCard: React.FC<AlgorithmCardProps> = ({ title, type, description, status, icon }) => {
  const statusColors = {
    standardized: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    finalist: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    alternative: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    research: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mr-3">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{type}</p>
      <p className="text-gray-700 dark:text-gray-300">{description}</p>
    </div>
  );
};

const PostQuantumCryptography: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <EducationHeader darkMode={darkMode} toggleTheme={toggleTheme} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Post-Quantum Cryptography</h1>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mx-auto max-w-3xl">
              <h2 className="text-xl font-semibold mb-2 flex items-center justify-center">
                <FiInfo className="mr-2" /> Preparing for the Quantum Era
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Post-quantum cryptography (PQC) refers to cryptographic algorithms that are believed to be secure against an attack by a quantum 
                computer. As quantum computers advance, current public-key algorithms like RSA and ECC will become vulnerable. This page explores 
                the various approaches to quantum-resistant cryptography.
              </p>
            </div>
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-center">Why We Need Post-Quantum Cryptography</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center mb-4">
                  <FiShield size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Quantum Threat</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Shor's algorithm running on a quantum computer can efficiently break RSA, DSA, and ECC - the cryptographic 
                  foundation of today's secure communications.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center mb-4">
                  <FiLock size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Long-term Security</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Information encrypted today may be stored by adversaries until quantum computers can break the encryption. 
                  We need to transition before quantum computers arrive.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-4">
                  <FiKey size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Standardization</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  NIST has been leading a standardization process since 2016 to identify and evaluate quantum-resistant 
                  algorithms for widespread adoption.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">NIST Standardized Algorithms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AlgorithmCard
                title="ML-KEM (Kyber)"
                type="Key Encapsulation Mechanism"
                description="Based on the hardness of the Module Learning With Errors (MLWE) problem. ML-KEM provides a balanced approach between key size, ciphertext size, and performance."
                status="standardized"
                icon={<FiKey size={20} />}
              />
              <AlgorithmCard
                title="ML-DSA (Dilithium)"
                type="Digital Signature Algorithm"
                description="Based on the hardness of the Module Learning With Errors (MLWE) problem and the Short Integer Solution (SIS) problem. Provides a good balance of signature size and key size."
                status="standardized"
                icon={<FiLock size={20} />}
              />
              <AlgorithmCard
                title="FALCON"
                type="Digital Signature Algorithm"
                description="Based on the hardness of the NTRU lattice problem. FALCON offers smaller signatures than Dilithium but has more complex implementation requirements."
                status="standardized"
                icon={<FiLock size={20} />}
              />
              <AlgorithmCard
                title="SPHINCS+"
                type="Digital Signature Algorithm"
                description="Based on hash functions only, offering a high security assurance as a stateless hash-based signature scheme. It has larger signatures but is widely trusted."
                status="standardized"
                icon={<FiLock size={20} />}
              />
            </div>
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Additional Candidates & Research</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AlgorithmCard
                title="NTRU"
                type="Key Encapsulation Mechanism"
                description="One of the oldest lattice-based cryptosystems, based on the hardness of the NTRU problem. It's being considered as an alternative to Kyber."
                status="alternative"
                icon={<FiKey size={20} />}
              />
              <AlgorithmCard
                title="SIKE"
                type="Key Encapsulation Mechanism"
                description="Based on isogenies of supersingular elliptic curves. Though broken in recent research, new variants are being developed with improved security."
                status="research"
                icon={<FiKey size={20} />}
              />
              <AlgorithmCard
                title="McEliece"
                type="Key Encapsulation Mechanism"
                description="One of the oldest post-quantum algorithms, based on error-correcting codes. Has large keys but is widely trusted due to its long history."
                status="finalist"
                icon={<FiKey size={20} />}
              />
              <AlgorithmCard
                title="Picnic"
                type="Digital Signature Algorithm"
                description="Based on zero-knowledge proofs and symmetric-key primitives. Offers an interesting alternative approach to post-quantum signatures."
                status="research"
                icon={<FiLock size={20} />}
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Practical Migration Strategy</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li className="text-gray-700 dark:text-gray-300">
                <strong>Inventory</strong>: Identify all systems using vulnerable cryptography (RSA, ECC, DSA)
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <strong>Prioritize</strong>: Focus first on long-lived secrets and critical infrastructure
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <strong>Crypto-agility</strong>: Design systems to allow easy cryptographic algorithm replacement
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <strong>Hybrid approach</strong>: Implement both classical and post-quantum cryptography during transition
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <strong>Stay informed</strong>: Follow NIST standards and cryptanalysis developments
              </li>
            </ol>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Further Resources</h2>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://csrc.nist.gov/Projects/post-quantum-cryptography" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  NIST Post-Quantum Cryptography Standardization
                </a>
              </li>
              <li>
                <a 
                  href="https://www.quantum-safe.ca/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Canadian Institute for Quantum Computing
                </a>
              </li>
              <li>
                <a 
                  href="https://openquantumsafe.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Open Quantum Safe Project
                </a>
              </li>
              <li>
                <a 
                  href="https://www.etsi.org/technologies/quantum-safe-cryptography" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  ETSI Quantum-Safe Cryptography
                </a>
              </li>
            </ul>
          </div>
        </div>
      </main>
      
      <EducationFooter />
    </div>
  );
};

export default PostQuantumCryptography; 