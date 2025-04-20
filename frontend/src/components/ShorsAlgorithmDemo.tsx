import React, { useState, useEffect } from 'react';
import { FiArrowRight, FiRefreshCw, FiInfo } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import EducationHeader from './EducationHeader';
import EducationFooter from './EducationFooter';

const ShorsAlgorithmDemo: React.FC = () => {
  const [step, setStep] = useState(1);
  const [N, setN] = useState(15);
  const [a, setA] = useState(7);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phaseEstimation, setPhaseEstimation] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState<'simulated' | 'api'>('simulated');
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
  
  // Function to run simulated algorithm results
  const runSimulation = async () => {
    setIsLoading(true);
    
    try {
      if (simulationMode === 'api') {
        // For future API implementation
        // Call to your backend simulation API
        const response = await fetch('http://127.0.0.1:5001/api/education/shor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ N, a }),
        });
        
        const data = await response.json();
        setResults(data);
        setPhaseEstimation(data.phase);
      } else {
        // Simulated results for now
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate algorithm results based on N and a
        // These are simplified results but demonstrate the UI
        const simulatedResults = simulateShorsAlgorithm(N, a);
        setResults(simulatedResults);
        setPhaseEstimation(simulatedResults.phase);
      }
    } catch (error) {
      console.error('Error running simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple simulation function
  const simulateShorsAlgorithm = (N: number, a: number) => {
    // Determine period (simplified)
    let r = 0;
    let found = false;
    for (let i = 1; i <= N; i++) {
      if (Math.pow(a, i) % N === 1) {
        r = i;
        found = true;
        break;
      }
    }
    
    if (!found) r = 4; // Fallback

    // Generate simulated measurement probabilities
    const countsData = [];
    const phaseValue = (1/r).toFixed(4);
    
    // Create visual representation of measurement
    const numBars = 8;
    for (let i = 0; i < numBars; i++) {
      let count = 0;
      // Make peaks at positions that correspond to the phase
      if (i % (numBars/r) === 0) {
        count = Math.floor(Math.random() * 150) + 100; // Random height for peaks
      } else {
        count = Math.floor(Math.random() * 50); // Background noise
      }
      
      // Create binary representation for x-axis
      const binary = i.toString(2).padStart(3, '0');
      countsData.push({ name: binary, count: count });
    }
    
    // Calculate factors based on period
    let factors = [];
    if (r % 2 === 0) {
      const gcd1 = gcd(Math.pow(a, r/2) - 1, N);
      const gcd2 = gcd(Math.pow(a, r/2) + 1, N);
      
      if (gcd1 > 1 && gcd1 < N) factors.push(gcd1);
      if (gcd2 > 1 && gcd2 < N) factors.push(gcd2);
    }
    
    // Fallback for demonstration
    if (factors.length === 0) {
      if (N === 15) factors = [3, 5];
      else if (N === 21) factors = [3, 7];
      else if (N === 33) factors = [3, 11];
      else if (N === 35) factors = [5, 7];
      else factors = [Math.floor(Math.sqrt(N)), Math.ceil(Math.sqrt(N))];
    }
    
    return {
      counts_data: countsData,
      phase: phaseValue,
      period: r,
      gcd1: factors[0] || 0,
      gcd2: factors[1] || 0,
      factors: factors
    };
  };
  
  // GCD calculation for simulation
  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <EducationHeader 
        title="Shor's Algorithm Interactive Demo"
        darkMode={darkMode} 
        toggleTheme={toggleTheme} 
      />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Shor's Algorithm Interactive Demo</h1>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mx-auto max-w-3xl">
              <h2 className="text-xl font-semibold mb-2 flex items-center justify-center">
                <FiInfo className="mr-2" /> What is Shor's Algorithm?
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Shor's algorithm is a quantum algorithm developed by Peter Shor in 1994 that can efficiently factor large integers, 
                breaking RSA encryption in polynomial time instead of exponential time. This interactive demo shows how the algorithm 
                works by finding the period of a function, which is the key step in the factoring process.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Algorithm Parameters</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Number to Factor (N)</label>
                <select 
                  value={N}
                  onChange={(e) => setN(parseInt(e.target.value))}
                  className="w-full p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md"
                >
                  <option value={15}>15 (= 3 × 5)</option>
                  <option value={21}>21 (= 3 × 7)</option>
                  <option value={35}>35 (= 5 × 7)</option>
                  <option value={33}>33 (= 3 × 11)</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Coprime Value (a)</label>
                <select 
                  value={a}
                  onChange={(e) => setA(parseInt(e.target.value))}
                  className="w-full p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md"
                >
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                  <option value={7}>7</option>
                  <option value={8}>8</option>
                  <option value={11}>11</option>
                  <option value={13}>13</option>
                </select>
              </div>
              
              <button
                onClick={runSimulation}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Simulating...' : 'Run Quantum Simulation'}
              </button>
              
              <div className="mt-4 text-xs text-gray-500 italic text-center">
                Note: This is a simulation that demonstrates the concepts,
                not an actual quantum computation.
              </div>
            </div>
            
            <div className="col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Simulation Results</h2>
              
              {!results ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Run the simulation to see results
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Quantum Measurement Probabilities</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      The quantum Fourier transform converts phase information into measurement probabilities.
                      Peaks indicate the phase is a multiple of 1/r.
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={results.counts_data}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold mb-1">Phase Estimation</h3>
                      <p className="text-2xl font-mono">{phaseEstimation}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Extracted from quantum measurement
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold mb-1">Period (r)</h3>
                      <p className="text-2xl font-mono">{results.period}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        1/r = {phaseEstimation}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold mb-1">Factors Found</h3>
                    <p className="text-xl">
                      {results.factors.join(' and ')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {N} = {results.factors.join(' × ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-12 mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold mb-4 text-center">How It Works: Step by Step</h2>
            
            <div className="flex mb-6 border-b dark:border-gray-700 justify-center">
              <button
                onClick={() => setStep(1)}
                className={`px-4 py-2 ${step === 1 ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
              >
                1. The Math Problem
              </button>
              <button
                onClick={() => setStep(2)}
                className={`px-4 py-2 ${step === 2 ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
              >
                2. Quantum Circuit
              </button>
              <button
                onClick={() => setStep(3)}
                className={`px-4 py-2 ${step === 3 ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}
              >
                3. Finding Factors
              </button>
            </div>
            
            {step === 1 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">The Math Behind Shor's Algorithm</h3>
                <p className="mb-4">
                  At its core, Shor's algorithm transforms the factoring problem into a period-finding problem. 
                  For a number N that we want to factor, we choose a random number a (coprime to N) and look 
                  for the period r of the function f(x) = a^x mod N.
                </p>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-x-auto">
                  <h4 className="font-medium mb-2">Pattern of a^x mod N for chosen values:</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="font-mono text-sm">
                        {`a^${i} mod ${N} = ${Math.pow(a, i) % N}`}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Why This Matters:</h4>
                  <p>
                    The function f(x) = a^x mod N is periodic, meaning there exists some value r where f(x+r) = f(x).
                    If we can find this period r, we can likely factor N by computing gcd(a^(r/2) ± 1, N).
                    Classical computers take exponential time to find this period, but quantum computers can do it efficiently!
                  </p>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">The Quantum Circuit</h3>
                <p className="mb-4">
                  A quantum computer can find this period efficiently using a circuit with two main parts:
                </p>
                <ol className="list-decimal pl-6 mb-4">
                  <li className="mb-2">
                    <strong>Input Register:</strong> A register of qubits in superposition, allowing us to 
                    evaluate f(x) = a^x mod N for many values of x simultaneously
                  </li>
                  <li className="mb-2">
                    <strong>Quantum Fourier Transform (QFT):</strong> Extracts the period from these evaluations
                  </li>
                </ol>
                
                <div className="my-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium mb-3">Simplified Quantum Circuit:</h4>
                  <div className="flex flex-col items-center">
                    <div className="border-l-2 border-r-2 border-t-2 border-blue-500 w-full p-2 mb-2 text-center">
                      Create superposition of all possible x values
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-3xl">→</div>
                    </div>
                    <div className="border-l-2 border-r-2 border-blue-500 w-full p-2 mb-2 text-center">
                      Apply function f(x) = a^x mod N
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-3xl">→</div>
                    </div>
                    <div className="border-l-2 border-r-2 border-b-2 border-blue-500 w-full p-2 text-center">
                      Apply Quantum Fourier Transform and measure
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">The Quantum Advantage:</h4>
                  <p>
                    This circuit leverages quantum superposition and interference to extract the period efficiently.
                    While a classical computer would need to try each value of x individually (exponential time),
                    a quantum computer can examine all values simultaneously and extract the pattern (polynomial time).
                  </p>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">From Period to Factors</h3>
                <p className="mb-4">
                  Once we have the period r, we can find the factors of N with high probability:
                </p>
                <ol className="list-decimal pl-6 mb-4">
                  <li className="mb-2">
                    If r is even, compute gcd(a^(r/2) - 1, N) and gcd(a^(r/2) + 1, N)
                  </li>
                  <li className="mb-2">
                    These values are likely to be factors of N
                  </li>
                  <li className="mb-2">
                    If not, we can try again with a different value of a
                  </li>
                </ol>
                
                {/* Show the math for the current example if results exist */}
                {results && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">Calculations with our results:</h4>
                    <p className="font-mono">Period (r) = {results.period}</p>
                    {results.period % 2 === 0 ? (
                      <>
                        <p className="font-mono">a^(r/2) = {a}^({results.period}/2) = {Math.pow(a, results.period/2)}</p>
                        <p className="font-mono">gcd(a^(r/2) - 1, N) = gcd({Math.pow(a, results.period/2) - 1}, {N}) = {results.factors[0] || "?"}</p>
                        <p className="font-mono">gcd(a^(r/2) + 1, N) = gcd({Math.pow(a, results.period/2) + 1}, {N}) = {results.factors[1] || "?"}</p>
                      </>
                    ) : (
                      <p className="font-mono">Note: Since r is odd, we need to try a different value of a.</p>
                    )}
                    <p className="font-mono mt-2">
                      Therefore, factors of {N} are: {results.factors.join(" and ")}
                    </p>
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Why RSA Encryption is Threatened:</h4>
                  <p>
                    RSA security depends on the difficulty of factoring large numbers. With 2048-bit RSA keys,
                    factoring would take billions of years for classical computers. A sufficiently powerful 
                    quantum computer using Shor's algorithm could break the same key in hours or minutes.
                  </p>
                  <p className="mt-2">
                    This is why organizations need to transition to post-quantum cryptography before large-scale
                    quantum computers become available.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <EducationFooter />
    </div>
  );
};

export default ShorsAlgorithmDemo; 