import React, { useState, useRef, useEffect } from 'react';
import { FiRefreshCw, FiMaximize, FiInfo } from 'react-icons/fi';
import EducationHeader from './EducationHeader';
import EducationFooter from './EducationFooter';

// Define the qubit states types
type QubitState = '0' | '1' | '+' | '-' | 'R' | 'L';

// Mathematical conversion helpers for visualization
const blochCoordinates = (state: QubitState): [number, number, number] => {
  switch (state) {
    case '0': return [0, 0, 1]; // North pole
    case '1': return [0, 0, -1]; // South pole
    case '+': return [1, 0, 0]; // +x axis
    case '-': return [-1, 0, 0]; // -x axis
    case 'R': return [0, 1, 0]; // +y axis (right)
    case 'L': return [0, -1, 0]; // -y axis (left)
    default: return [0, 0, 1];
  }
};

// Component for the bloch sphere visualization
const BlochSphere: React.FC<{ state: QubitState }> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw the Bloch sphere
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Draw the sphere (circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw the axes
    ctx.beginPath();
    // z-axis (vertical)
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    // x-axis (horizontal)
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    // y-axis (coming out of the screen, drawn as a circle)
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI);
    
    ctx.strokeStyle = '#9CA3AF';
    ctx.stroke();
    
    // Add labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', centerX, centerY - radius - 10); // North pole
    ctx.fillText('|1⟩', centerX, centerY + radius + 20); // South pole
    ctx.fillText('|+⟩', centerX + radius + 15, centerY); // +x axis
    ctx.fillText('|-⟩', centerX - radius - 15, centerY); // -x axis
    ctx.fillText('|R⟩', centerX + 15, centerY - 15); // Near the y-axis
    ctx.fillText('|L⟩', centerX - 15, centerY - 15); // Near the negative y-axis
    
    // Convert Bloch coordinates to canvas coordinates
    const [x, y, z] = blochCoordinates(state);
    const stateX = centerX + x * radius * 0.8;
    const stateY = centerY - z * radius * 0.8; // Negative because canvas y increases downward
    
    // Draw the state vector
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(stateX, stateY);
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw the state point
    ctx.beginPath();
    ctx.arc(stateX, stateY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#3B82F6';
    ctx.fill();
    
  }, [state]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={300} 
      className="mx-auto border border-gray-200 dark:border-gray-700 rounded-lg"
    />
  );
};

const QubitVisualization: React.FC = () => {
  const [state, setState] = useState<QubitState>('0');
  const [measurement, setMeasurement] = useState<null | '0' | '1'>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [measurements, setMeasurements] = useState<{ result: '0' | '1', count: number }[]>([
    { result: '0', count: 0 },
    { result: '1', count: 0 }
  ]);
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
  
  // Probability calculations based on state
  const probabilities = (() => {
    switch(state) {
      case '0': return { '0': 1, '1': 0 };
      case '1': return { '0': 0, '1': 1 };
      case '+': 
      case '-': 
      case 'R': 
      case 'L': return { '0': 0.5, '1': 0.5 };
      default: return { '0': 0.5, '1': 0.5 };
    }
  })();
  
  const resetQubit = () => {
    setMeasurement(null);
    setShowAnimation(false);
  };
  
  const measureQubit = () => {
    if (measurement !== null) return;
    
    setShowAnimation(true);
    
    // Simulate measurement after animation
    setTimeout(() => {
      // Simulate measurement based on probabilities
      const result = Math.random() < probabilities['0'] ? '0' : '1';
      setMeasurement(result);
      setShowAnimation(false);
      
      // Update measurement statistics
      setMeasurements(prev => 
        prev.map(item => 
          item.result === result 
            ? { ...item, count: item.count + 1 } 
            : item
        )
      );
    }, 1000);
  };
  
  const measureMultipleTimes = (times: number) => {
    resetQubit();
    
    // Reset statistics
    setMeasurements([
      { result: '0', count: 0 },
      { result: '1', count: 0 }
    ]);
    
    // Perform multiple measurements
    for (let i = 0; i < times; i++) {
      const result = Math.random() < probabilities['0'] ? '0' : '1';
      setMeasurements(prev => 
        prev.map(item => 
          item.result === result 
            ? { ...item, count: item.count + 1 } 
            : item
        )
      );
    }
  };
  
  // Get mathematical representation based on state
  const getStateVector = (qubitState: QubitState): string => {
    switch(qubitState) {
      case '0': return '|0⟩';
      case '1': return '|1⟩';
      case '+': return '\\frac{1}{\\sqrt{2}}(|0⟩ + |1⟩)';
      case '-': return '\\frac{1}{\\sqrt{2}}(|0⟩ - |1⟩)';
      case 'R': return '\\frac{1}{\\sqrt{2}}(|0⟩ + i|1⟩)';
      case 'L': return '\\frac{1}{\\sqrt{2}}(|0⟩ - i|1⟩)';
      default: return '|0⟩';
    }
  };
  
  // Calculate percentages for statistics
  const totalMeasurements = measurements.reduce((sum, item) => sum + item.count, 0);
  const percentages = measurements.map(item => ({
    ...item,
    percentage: totalMeasurements > 0 ? (item.count / totalMeasurements) * 100 : 0
  }));
  
  return (
    <div className="min-h-screen flex flex-col">
      <EducationHeader darkMode={darkMode} toggleTheme={toggleTheme} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Quantum Bits (Qubits) Explained</h1>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mx-auto max-w-3xl">
              <h2 className="text-xl font-semibold mb-2 flex items-center justify-center">
                <FiInfo className="mr-2" /> Understanding Quantum Superposition
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Unlike classical bits that can only be 0 or 1, quantum bits (qubits) can exist in a superposition 
                of states. This interactive visualization demonstrates how qubits behave, including the concept of 
                measurement and quantum probability.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6 text-center">Interactive Qubit</h2>
              
              <div className="flex flex-col items-center">
                {/* Bloch sphere visualization */}
                <div className="relative mb-6">
                  {showAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse">
                        Measuring...
                      </div>
                    </div>
                  )}
                  <BlochSphere state={state} />
                </div>
                
                {/* State selection buttons */}
                <div className="grid grid-cols-3 gap-3 mb-6 w-full">
                  <button
                    onClick={() => { setState('0'); resetQubit(); }}
                    className={`p-2 rounded font-mono ${state === '0' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    |0⟩
                  </button>
                  <button
                    onClick={() => { setState('1'); resetQubit(); }}
                    className={`p-2 rounded font-mono ${state === '1' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    |1⟩
                  </button>
                  <button
                    onClick={() => { setState('+'); resetQubit(); }}
                    className={`p-2 rounded font-mono ${state === '+' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    |+⟩
                  </button>
                  <button
                    onClick={() => { setState('-'); resetQubit(); }}
                    className={`p-2 rounded font-mono ${state === '-' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    |-⟩
                  </button>
                  <button
                    onClick={() => { setState('R'); resetQubit(); }}
                    className={`p-2 rounded font-mono ${state === 'R' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    |R⟩
                  </button>
                  <button
                    onClick={() => { setState('L'); resetQubit(); }}
                    className={`p-2 rounded font-mono ${state === 'L' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    |L⟩
                  </button>
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-3 mb-6">
                  <button
                    onClick={measureQubit}
                    disabled={!!measurement || showAnimation}
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                  >
                    Measure
                  </button>
                  <button
                    onClick={resetQubit}
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                  >
                    Reset
                  </button>
                </div>
                
                {/* Measurement result */}
                {measurement !== null && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <h3 className="font-semibold">Measurement Result</h3>
                    <p className="text-4xl font-mono mt-2">{measurement}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-center">What Makes Qubits Special?</h2>
              
              <p className="mb-4">
                Unlike classical bits that can only be 0 or 1, quantum bits (qubits) can exist in a 
                superposition of states, effectively holding multiple values at once:
              </p>
              
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-mono text-center">
                  |ψ⟩ = α|0⟩ + β|1⟩
                </p>
                <p className="text-sm text-center mt-2">
                  where |α|² + |β|² = 1, representing probabilities
                </p>
              </div>
              
              <h3 className="font-semibold mb-2">Current Qubit State: |{state}⟩</h3>
              <p className="text-sm mb-4">
                Mathematical representation: {getStateVector(state)}
              </p>
              
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span>Probability of |0⟩</span>
                  <span>{(probabilities['0'] * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${probabilities['0'] * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span>Probability of |1⟩</span>
                  <span>{(probabilities['1'] * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${probabilities['1'] * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Multiple Measurements</h3>
                <p className="text-sm mb-3">
                  Quantum measurement is probabilistic. Run multiple measurements to see the distribution:
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => measureMultipleTimes(10)}
                    className="px-2 py-1 text-sm bg-indigo-600 text-white rounded"
                  >
                    10 Measurements
                  </button>
                  <button
                    onClick={() => measureMultipleTimes(100)}
                    className="px-2 py-1 text-sm bg-indigo-600 text-white rounded"
                  >
                    100 Measurements
                  </button>
                  <button
                    onClick={() => measureMultipleTimes(1000)}
                    className="px-2 py-1 text-sm bg-indigo-600 text-white rounded"
                  >
                    1000 Measurements
                  </button>
                </div>
                
                {totalMeasurements > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Measurement Statistics</h4>
                    <div className="space-y-2">
                      {percentages.map(item => (
                        <div key={item.result}>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Measured {item.result}</span>
                            <span>{item.count} times ({item.percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.result === '0' ? 'bg-green-500' : 'bg-purple-500'}`}
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <h3 className="font-semibold mb-2">Why This Matters for Cryptography:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Classical cryptography relies on mathematical problems that are hard for classical computers
                  </li>
                  <li>
                    Quantum computers can use qubits in superposition to solve some of these problems exponentially faster
                  </li>
                  <li>
                    Shor's algorithm leverages quantum superposition to factor large numbers quickly
                  </li>
                  <li>
                    This threatens RSA encryption, which depends on the difficulty of factoring large numbers
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <EducationFooter />
    </div>
  );
};

export default QubitVisualization; 