import React, { useState, useEffect } from 'react';
import { FiInfo, FiDatabase, FiSearch, FiKey } from 'react-icons/fi';
import EducationHeader from './EducationHeader';
import EducationFooter from './EducationFooter';

const GroversAlgorithm: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchSize, setSearchSize] = useState<number>(8);
  const [runSimulation, setRunSimulation] = useState<boolean>(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);

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

  // Run a simulation of Grover's algorithm
  useEffect(() => {
    if (!runSimulation) return;

    // Simple simulation of Grover's search
    const simulateGrover = () => {
      // Number of elements in database
      const N = Math.pow(2, searchSize);
      
      // Number of iterations needed by Grover's algorithm (approximately sqrt(N))
      const groversIterations = Math.floor(Math.PI / 4 * Math.sqrt(N));
      
      // Classical iterations (on average N/2)
      const classicalIterations = N / 2;
      
      // Classical time (normalized to 1 for each check)
      const classicalTime = classicalIterations;
      
      // Quantum time (also normalized, but each iteration is more complex)
      const quantumTime = groversIterations * Math.log2(N);
      
      // Speedup ratio
      const speedup = classicalTime / quantumTime;

      return {
        databaseSize: N,
        classicalIterations,
        groversIterations,
        classicalTime: classicalTime.toFixed(0),
        quantumTime: quantumTime.toFixed(2),
        speedup: speedup.toFixed(2),
        keyBitsReduction: Math.floor(Math.log2(speedup))
      };
    };

    // Simulate delay for calculation
    setTimeout(() => {
      const results = simulateGrover();
      setSimulationResults(results);
      setRunSimulation(false);
    }, 1000);
  }, [runSimulation, searchSize]);

  return (
    <div className="min-h-screen flex flex-col">
      <EducationHeader darkMode={darkMode} toggleTheme={toggleTheme} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Grover's Algorithm Explained</h1>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mx-auto max-w-3xl">
              <h2 className="text-xl font-semibold mb-2 flex items-center justify-center">
                <FiInfo className="mr-2" /> The Quantum Search Algorithm
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Grover's algorithm, developed by Lov Grover in 1996, provides a quadratic speedup for searching unstructured databases.
                While less devastating than Shor's algorithm for public-key cryptography, it significantly impacts symmetric encryption
                and hash functions by effectively reducing their security strength.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">How Grover's Algorithm Works</h2>
              
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mr-3">
                  <FiSearch size={20} />
                </div>
                <h3 className="text-lg font-medium">Quantum Search</h3>
              </div>
              
              <p className="mb-4">
                Grover's algorithm solves the problem of finding a specific item in an unsorted database of N items.
                While a classical computer would need to check, on average, N/2 items, Grover's algorithm can find
                the answer in approximately √N steps - a quadratic speedup.
              </p>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Key Steps:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Create a superposition of all possible states (representing database entries)</li>
                  <li>Apply a quantum oracle that marks the target item</li>
                  <li>Apply Grover's diffusion operator to amplify the amplitude of the marked item</li>
                  <li>Repeat steps 2-3 approximately √N times</li>
                  <li>Measure the system, which will yield the marked item with high probability</li>
                </ol>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mr-3">
                  <FiDatabase size={20} />
                </div>
                <h3 className="text-lg font-medium">Applications</h3>
              </div>
              
              <p>
                Beyond database searching, Grover's algorithm applies to any problem that can be framed as searching
                through a space of possible solutions, including:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Solving combinatorial optimization problems</li>
                <li>Finding collisions in hash functions</li>
                <li>Breaking symmetric encryption through brute-force key search</li>
                <li>Solving NP-complete problems with a quadratic speedup</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Interactive Demonstration</h2>
              
              <p className="mb-4">
                This interactive tool demonstrates the quantum advantage of Grover's algorithm over classical search.
                Select a database size (in bits) to see the comparison:
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Database Size (bits)</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="4"
                    max="64"
                    value={searchSize}
                    onChange={(e) => setSearchSize(parseInt(e.target.value))}
                    className="w-full mr-4"
                  />
                  <span className="font-mono">{searchSize} bits</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  (Database contains 2<sup>{searchSize}</sup> = {Math.pow(2, searchSize).toLocaleString()} entries)
                </p>
              </div>
              
              <button
                onClick={() => setRunSimulation(true)}
                disabled={runSimulation}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 mb-6"
              >
                {runSimulation ? 'Calculating...' : 'Run Simulation'}
              </button>
              
              {simulationResults && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium mb-3">Simulation Results:</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Classical Search:</p>
                      <p className="text-lg font-mono">{simulationResults.classicalIterations.toLocaleString()} iterations</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Grover's Algorithm:</p>
                      <p className="text-lg font-mono">{simulationResults.groversIterations.toLocaleString()} iterations</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium">Quantum Speedup:</p>
                    <p className="text-xl font-mono text-green-600 dark:text-green-400">
                      {simulationResults.speedup}× faster
                    </p>
                  </div>
                  
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                    <p className="text-sm font-medium">Security Impact:</p>
                    <p>
                      Effectively reduces symmetric key strength by ~{simulationResults.keyBitsReduction} bits
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Impact on Cryptography</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center mr-3">
                    <FiKey size={20} />
                  </div>
                  <h3 className="text-lg font-medium">Symmetric Encryption</h3>
                </div>
                
                <p className="mb-3">
                  Grover's algorithm impacts symmetric encryption by providing a quadratic speedup for brute-force key 
                  searches. This effectively reduces the security of symmetric keys by half:
                </p>
                
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>AES-128 would provide only ~64 bits of security against quantum attacks</li>
                  <li>AES-256 would provide ~128 bits of security, still considered sufficient</li>
                </ul>
                
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="font-medium">Mitigation:</p>
                  <p>Double key lengths to maintain the same security level against quantum attacks</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mr-3">
                    <FiSearch size={20} />
                  </div>
                  <h3 className="text-lg font-medium">Hash Functions</h3>
                </div>
                
                <p className="mb-3">
                  Hash functions are similarly affected by Grover's algorithm, which can accelerate:
                </p>
                
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>Pre-image attacks: Finding an input that produces a specific hash output</li>
                  <li>Second pre-image attacks: Finding a different input with the same hash as a given input</li>
                  <li>Collision finding: The BHT algorithm combines Grover's with classical techniques</li>
                </ul>
                
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="font-medium">Mitigation:</p>
                  <p>Use hash functions with longer outputs (e.g., SHA-384, SHA-512 instead of SHA-256)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Grover vs. Shor: Understanding the Difference</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left">Aspect</th>
                    <th className="px-4 py-2 text-left">Grover's Algorithm</th>
                    <th className="px-4 py-2 text-left">Shor's Algorithm</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 font-medium">Speedup</td>
                    <td className="px-4 py-3">Quadratic (√N vs N)</td>
                    <td className="px-4 py-3">Exponential</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Affects</td>
                    <td className="px-4 py-3">Symmetric encryption, hash functions</td>
                    <td className="px-4 py-3">Public-key cryptography (RSA, ECC, DSA)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Remedy</td>
                    <td className="px-4 py-3">Double key lengths</td>
                    <td className="px-4 py-3">Replace with quantum-resistant algorithms</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Urgency</td>
                    <td className="px-4 py-3">Moderate (current AES-256 remains secure)</td>
                    <td className="px-4 py-3">High (completely breaks affected algorithms)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">NIST Response</td>
                    <td className="px-4 py-3">Recommend AES-256, SHA-384+</td>
                    <td className="px-4 py-3">Standardizing PQC alternatives</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      
      <EducationFooter />
    </div>
  );
};

export default GroversAlgorithm; 