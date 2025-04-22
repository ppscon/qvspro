import React, { useState, useEffect } from 'react';
import { FiSearch, FiBook, FiInfo } from 'react-icons/fi';
import EducationHeader from './EducationHeader';
import EducationFooter from './EducationFooter';

interface GlossaryEntry {
  term: string;
  definition: string;
  category: 'quantum' | 'cryptography' | 'algorithm' | 'threat';
}

const QuantumGlossary: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredEntries, setFilteredEntries] = useState<GlossaryEntry[]>([]);

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

  // Glossary entries
  const glossaryEntries: GlossaryEntry[] = [
    {
      term: 'Quantum Computer',
      definition: 'A computing device that uses quantum-mechanical phenomena such as superposition and entanglement to perform operations on data. Unlike classical computers that use bits (0s and 1s), quantum computers use quantum bits or qubits.',
      category: 'quantum'
    },
    {
      term: 'Qubit',
      definition: 'The basic unit of quantum information, analogous to a bit in classical computing. Unlike classical bits, qubits can exist in a superposition of states, representing both 0 and 1 simultaneously.',
      category: 'quantum'
    },
    {
      term: 'Superposition',
      definition: 'A fundamental principle of quantum mechanics where quantum systems can exist in multiple states simultaneously. For qubits, this means they can represent both 0 and 1 at the same time, enabling quantum computers to process multiple possibilities simultaneously.',
      category: 'quantum'
    },
    {
      term: 'Entanglement',
      definition: 'A quantum phenomenon where two or more qubits become correlated in such a way that the quantum state of each particle cannot be described independently of the others, regardless of the distance separating them.',
      category: 'quantum'
    },
    {
      term: 'Quantum Supremacy',
      definition: 'The point at which a quantum computer can solve a problem that would be practically impossible for classical computers to solve in a reasonable timeframe.',
      category: 'quantum'
    },
    {
      term: 'Quantum Volume',
      definition: 'A metric used to measure the performance of quantum computers, taking into account both the number of qubits and their error rates.',
      category: 'quantum'
    },
    {
      term: 'Quantum Gate',
      definition: 'The quantum computing equivalent of a logic gate in classical computing. Quantum gates manipulate qubits and are the building blocks of quantum circuits.',
      category: 'quantum'
    },
    {
      term: 'Quantum Fourier Transform',
      definition: 'A quantum algorithm that transforms a quantum state into its Fourier transform. It is a key component in many quantum algorithms, including Shor\'s algorithm.',
      category: 'algorithm'
    },
    {
      term: 'Shor\'s Algorithm',
      definition: 'A quantum algorithm developed by Peter Shor in 1994 that efficiently factors large integers in polynomial time, threatening RSA and other public-key cryptosystems that rely on the difficulty of factoring large numbers.',
      category: 'algorithm'
    },
    {
      term: 'Grover\'s Algorithm',
      definition: 'A quantum algorithm that provides a quadratic speedup for searching unsorted databases. It can be used to attack symmetric encryption by reducing the effective key length by half.',
      category: 'algorithm'
    },
    {
      term: 'NIST PQC Standardization',
      definition: 'A process by the National Institute of Standards and Technology to evaluate, select, and standardize quantum-resistant cryptographic algorithms to replace those vulnerable to quantum computing attacks.',
      category: 'cryptography'
    },
    {
      term: 'Post-Quantum Cryptography (PQC)',
      definition: 'Cryptographic algorithms believed to be secure against attacks from both classical and quantum computers. These include lattice-based, hash-based, code-based, multivariate, and isogeny-based cryptography.',
      category: 'cryptography'
    },
    {
      term: 'Cryptographic Agility',
      definition: 'The ability of a system to easily transition between different cryptographic algorithms, protocols, or key sizes without significant modifications to the system architecture.',
      category: 'cryptography'
    },
    {
      term: 'Lattice-Based Cryptography',
      definition: 'A family of cryptographic constructions based on the hardness of problems in lattices, such as Learning With Errors (LWE) and Ring-LWE. Examples include ML-KEM (Kyber) and ML-DSA (Dilithium).',
      category: 'cryptography'
    },
    {
      term: 'Hash-Based Cryptography',
      definition: 'A cryptographic approach that relies on the security properties of hash functions. Hash-based signatures like SPHINCS+ (SLH-DSA) are considered quantum-resistant.',
      category: 'cryptography'
    },
    {
      term: 'Code-Based Cryptography',
      definition: 'A cryptographic system based on error-correcting codes, where the difficulty lies in decoding a random linear code. Examples include McEliece and HQC.',
      category: 'cryptography'
    },
    {
      term: 'Multivariate Cryptography',
      definition: 'Cryptographic systems based on the difficulty of solving systems of multivariate polynomials over finite fields.',
      category: 'cryptography'
    },
    {
      term: 'Isogeny-Based Cryptography',
      definition: 'A cryptographic approach based on finding isogenies between elliptic curves. SIKE was a prominent example before being broken by classical attacks.',
      category: 'cryptography'
    },
    {
      term: 'Quantum Key Distribution (QKD)',
      definition: 'A method to securely distribute cryptographic keys using properties of quantum mechanics. It enables two parties to produce a shared random secret key without an eavesdropper being able to learn the key.',
      category: 'cryptography'
    },
    {
      term: 'Harvest Now, Decrypt Later (HNDL)',
      definition: 'A threat scenario where adversaries collect and store currently encrypted data with the intention of decrypting it later when quantum computers become available.',
      category: 'threat'
    },
    {
      term: 'Q-Day',
      definition: 'A theoretical future date when a quantum computer becomes powerful enough to break widely used public-key cryptography.',
      category: 'threat'
    },
    {
      term: 'Cryptographically Relevant Quantum Computer (CRQC)',
      definition: 'A quantum computer with sufficient qubits and low enough error rates to pose a threat to current cryptographic systems.',
      category: 'threat'
    },
    {
      term: 'ML-KEM (Kyber)',
      definition: 'A lattice-based Key Encapsulation Mechanism selected by NIST for standardization as the primary quantum-resistant key establishment algorithm.',
      category: 'cryptography'
    },
    {
      term: 'ML-DSA (Dilithium)',
      definition: 'A lattice-based Digital Signature Algorithm selected by NIST for standardization as a quantum-resistant signature scheme.',
      category: 'cryptography'
    },
    {
      term: 'SLH-DSA (SPHINCS+)',
      definition: 'A stateless hash-based signature scheme standardized by NIST that derives its security from the properties of cryptographic hash functions.',
      category: 'cryptography'
    },
    {
      term: 'FN-DSA (Falcon)',
      definition: 'A lattice-based signature scheme based on NTRU lattices, selected by NIST for standardization.',
      category: 'cryptography'
    },
    {
      term: 'Quantum Random Number Generator (QRNG)',
      definition: 'A device that generates random numbers using quantum processes, which are fundamentally random according to quantum mechanics.',
      category: 'quantum'
    },
    {
      term: 'Quantum Error Correction',
      definition: 'Techniques to protect quantum information from errors due to decoherence and other quantum noise, essential for building practical quantum computers.',
      category: 'quantum'
    },
    {
      term: 'Logical Qubit',
      definition: 'A qubit that is protected against errors using quantum error correction, typically requiring multiple physical qubits.',
      category: 'quantum'
    },
    {
      term: 'Hybrid Cryptography',
      definition: 'The practice of combining both classical and post-quantum algorithms during the transition period to ensure security against both classical and quantum attacks.',
      category: 'cryptography'
    }
  ];

  // Filter entries based on search term and category
  useEffect(() => {
    let filtered = glossaryEntries;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.term.toLowerCase().includes(search) || 
        entry.definition.toLowerCase().includes(search)
      );
    }
    
    // Sort alphabetically
    filtered = [...filtered].sort((a, b) => a.term.localeCompare(b.term));
    
    setFilteredEntries(filtered);
  }, [searchTerm, selectedCategory, glossaryEntries]);

  // Category label and styling
  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'quantum': return { label: 'Quantum Computing', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' };
      case 'cryptography': return { label: 'Cryptography', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' };
      case 'algorithm': return { label: 'Algorithm', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' };
      case 'threat': return { label: 'Security Threat', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
      default: return { label: category, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <EducationHeader 
        title="Quantum Computing Glossary"
        darkMode={darkMode} 
        toggleTheme={toggleTheme} 
      />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Quantum Computing Glossary</h1>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mx-auto max-w-3xl">
              <h2 className="text-xl font-semibold mb-2 flex items-center justify-center">
                <FiBook className="mr-2" /> Essential Terminology
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                This glossary provides definitions for key terms in quantum computing, post-quantum cryptography, 
                and quantum security. Understanding these concepts is essential for navigating the rapidly evolving 
                landscape of quantum-safe security.
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search terms and definitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === 'all' 
                      ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800' 
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  All Terms
                </button>
                <button
                  onClick={() => setSelectedCategory('quantum')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === 'quantum' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                  }`}
                >
                  Quantum Computing
                </button>
                <button
                  onClick={() => setSelectedCategory('cryptography')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === 'cryptography' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}
                >
                  Cryptography
                </button>
                <button
                  onClick={() => setSelectedCategory('algorithm')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === 'algorithm' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}
                >
                  Algorithms
                </button>
                <button
                  onClick={() => setSelectedCategory('threat')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === 'threat' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  Security Threats
                </button>
              </div>
            </div>
            
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FiInfo size={48} className="mx-auto mb-4 opacity-50" />
                <p>No terms found matching your criteria.</p>
                <p className="text-sm mt-2">Try adjusting your search or category filter.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredEntries.map((entry, index) => {
                  const category = getCategoryLabel(entry.category);
                  return (
                    <div key={index} className="border-b dark:border-gray-700 pb-6 last:border-b-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{entry.term}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${category.color}`}>
                          {category.label}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{entry.definition}</p>
                    </div>
                  );
                })}
              </div>
            )}
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
                  href="https://quantum.gov/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  U.S. National Quantum Initiative
                </a>
              </li>
              <li>
                <a 
                  href="https://www.ibm.com/quantum/what-is-quantum-computing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  IBM Quantum Computing Introduction
                </a>
              </li>
              <li>
                <a 
                  href="https://www.cisa.gov/quantum" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  CISA Quantum Readiness Resources
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

export default QuantumGlossary; 