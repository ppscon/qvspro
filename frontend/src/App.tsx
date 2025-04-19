import React, { useState, useEffect, useRef } from 'react';
import { FiSun, FiMoon, FiSearch, FiUpload, FiFile, FiFolder, FiTrash2, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import LandingPage from './LandingPage';
import QuantumRiskAssessment from './components/QuantumRiskAssessment';
import QuantumEducationHub from './components/QuantumEducationHub';
import ShorsAlgorithmDemo from './components/ShorsAlgorithmDemo';
import QubitVisualization from './components/QubitVisualization';
import PostQuantumCryptography from './components/PostQuantumCryptography';
import GroversAlgorithm from './components/GroversAlgorithm';
import QuantumGlossary from './components/QuantumGlossary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/Profile';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Full scanner app component
const ScannerApp: React.FC = () => {
  // State variables
  const [darkMode, setDarkMode] = useState(false);
  const [scanType, setScanType] = useState<'file' | 'directory'>('file');
  const [files, setFiles] = useState<File[]>([]);
  // Keep the directory state for future implementation
  const [directory, setDirectory] = useState<string | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [scanResults, setScanResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to scan');

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize theme based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);

    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(Array.from(event.target.files));
      setError(null);
      setStatusMessage(`${event.target.files.length} file(s) selected`);
      setScanResults(null);
    }
  };

  // Toggle between file and directory scan types
  const toggleScanType = (type: 'file' | 'directory') => {
    setScanType(type);
    // Clear previous selections and results
    setFiles([]);
    setDirectory(null);
    setScanResults(null);
    setError(null);
    setStatusMessage(`Ready to scan ${type === 'file' ? 'files' : 'directory'}`);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to check if an object contains React elements recursively
  const containsReactElement = (obj: any): boolean => {
    if (obj === null || obj === undefined) {
      return false;
    }
    
    if (React.isValidElement(obj)) {
      return true;
    }
    
    if (Array.isArray(obj)) {
      return obj.some(item => containsReactElement(item));
    }
    
    if (typeof obj === 'object') {
      return Object.values(obj).some(value => containsReactElement(value));
    }
    
    return false;
  };

  // Sanitize scan results to prevent React elements
  const sanitizeScanResults = (results: any[]): any[] => {
    try {
      // Check if results is an array
      if (!Array.isArray(results)) {
        console.error('Scan results is not an array:', results);
        return [];
      }

      return results.map((item: any) => {
        try {
          // Handle React elements, arrays, null, and undefined
          if (React.isValidElement(item) || Array.isArray(item) || item === null || item === undefined) {
            console.error('Invalid item in results:', item);
            return {}; // Return an empty object for invalid items
          }

          // Handle non-object items
          if (typeof item !== 'object') {
            console.error('Item is not an object:', item);
            return {}; // Return an empty object for non-object items
          }
          
          // Create a new sanitized object
          const sanitized: Record<string, any> = {};
          
          // Copy primitive values and check for nested React elements
          for (const [key, value] of Object.entries(item)) {
            if (containsReactElement(value)) {
              console.error(`React element found in property ${key}:`, value);
              sanitized[key] = value === null ? null : typeof value === 'object' ? {} : String(value);
            } else {
              sanitized[key] = value;
            }
          }
          
          return sanitized;
        } catch (itemError) {
          console.error('Error sanitizing item:', itemError);
          return {}; // Return an empty object on error
        }
      });
    } catch (error) {
      console.error('Error sanitizing scan results:', error);
      return []; // Return an empty array on error
    }
  };

  // Handle scan action
  const handleScan = async () => {
    if (scanType === 'file' && files.length === 0) {
      setError('Please select at least one file to scan');
      return;
    }

    if (scanType === 'directory' && !directory) {
      setError('Please select a directory to scan');
      return;
    }

    setIsLoading(true);
    setError(null);
    setScanResults(null);
    setStatusMessage('Scanning...');

    try {
      const formData = new FormData();

      if (scanType === 'file') {
        // Append each file to the formData
        files.forEach(file => {
          formData.append('files[]', file);
        });
      } else {
        // For directory scanning, which will be implemented in the backend
        formData.append('directory', directory || '');
      }

      const response = await fetch('http://127.0.0.1:5001/api/scan/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Scan failed with status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();

      // Sanitize results before setting state
      if (data.results && Array.isArray(data.results)) {
        data.results = sanitizeScanResults(data.results);
      }

      // Update state with results
      setScanResults(data);
      setStatusMessage('Scan completed successfully');
    } catch (err: any) {
      console.error('Error during scan:', err);
      setError(`Error: ${err.message}`);
      setStatusMessage('Scan failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset all scan data
  const handleReset = () => {
    setFiles([]);
    setDirectory(null);
    setScanResults(null);
    setError(null);
    setStatusMessage('Ready to scan');

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add this function inside ScannerApp
  const handleDemoScan = async () => {
    setIsLoading(true);
    setStatusMessage('Running demo scan on built-in quantum-vulnerable files...');
    setError(null);
    setFiles([]);
    setDirectory(null);
    setScanResults(null);
    try {
      const response = await fetch('http://127.0.0.1:5001/api/scan/demo');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Demo scan failed with status: ${response.status}. ${errorText}`);
      }
      const data = await response.json();
      setScanResults(data);
      setStatusMessage('Demo scan completed! These are results from built-in quantum-vulnerable test files.');
    } catch (err: any) {
      setError(`Demo scan error: ${err.message}`);
      setStatusMessage('Demo scan failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate file type labels
  const getFileTypeLabel = (file: File): JSX.Element => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    let color = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    
    switch (extension) {
      case 'py':
        color = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        break;
      case 'js':
      case 'ts':
        color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        break;
      case 'java':
        color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        break;
      case 'c':
      case 'cpp':
      case 'h':
        color = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        break;
      case 'go':
        color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        break;
      default:
        break;
    }
    
    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${color}`}>
        {extension.toUpperCase()}
      </span>
    );
  };

  let scanResultsHasReactElement = false;
  if (scanResults && scanResults.results) {
    for (const [i, res] of scanResults.results.entries()) {
      if (containsReactElement(res)) {
        // eslint-disable-next-line no-console
        console.error('React element or array found in scanResults.results at index', i, res);
        scanResultsHasReactElement = true;
        break;
      }
    }
  }

  return (
    <div className="App min-h-screen flex flex-col">
      <header className="header">
        <div className="container flex items-center justify-between">
          <h1 className="flex items-center">
            <Link to="/">
              <img
                src="/images/logo-qvs.png"
                alt="QVS-Pro Logo"
                className="logo-qvs"
              />
            </Link>
          </h1>

          <div className="flex items-center space-x-4">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/app" className="nav-link">
              Scanner
            </Link>
            <Link to="/education" className="nav-link">
              Learn
            </Link>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-theme"
              aria-label="Toggle theme"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                color: darkMode ? '#fbbf24' : '#1d4ed8'
              }}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="main flex-grow">
        <div className="container">
          <div className="mb-4">
            <h2 className="heading">Quantum Vulnerability Scanner</h2>
            <p className="subheading">
              Scan your codebase for cryptographic algorithms vulnerable to quantum computing attacks
            </p>
          </div>

          <div className="section p-6">
            {/* Scan type selection + Demo Scan button */}
            <div className="flex space-x-4 mb-6 items-center">
              <button
                type="button"
                onClick={() => toggleScanType('file')}
                className={`flex items-center px-4 py-2 rounded-md ${scanType === 'file'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
              >
                <FiFile className="mr-2" />
                File Scan
              </button>
              <button
                type="button"
                onClick={() => toggleScanType('directory')}
                className={`flex items-center px-4 py-2 rounded-md ${scanType === 'directory'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
              >
                <FiFolder className="mr-2" />
                Directory Scan
              </button>
              <button
                type="button"
                onClick={handleDemoScan}
                className="flex items-center px-4 py-2 rounded-md bg-yellow-400 text-gray-900 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                title="Try a demo scan using built-in quantum-vulnerable test files."
                disabled={isLoading}
                style={{ marginLeft: '1rem' }}
              >
                <FiSearch className="mr-2" />
                Demo Scan
              </button>
            </div>

            {/* File/Directory Selection */}
            <div className="mb-6">
              {scanType === 'file' ? (
                <div className="flex flex-col">
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary dark:hover:border-primary"
                    onClick={triggerFileInput}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <FiUpload className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={32} />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {files.length > 0
                        ? `${files.length} file(s) selected`
                        : 'Click to select or drag and drop files here'}
                    </p>
                    <button
                      type="button"
                      className="mt-2 px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-dark"
                    >
                      Select Files
                    </button>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Selected Files:</h3>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {Array.from(files).map((file, index) => (
                            <li key={index} className="py-2 flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="mr-2">{getFileTypeLabel(file)}</span>
                                <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-not-allowed opacity-60"
                >
                  <FiFolder className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={32} />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Directory scanning coming soon!
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleScan}
                disabled={isLoading || (scanType === 'file' && files.length === 0)}
                className="flex-1 flex justify-center items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scanning...
                  </>
                ) : (
                  <>
                    <FiSearch className="mr-2" />
                    Scan for Vulnerabilities
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiTrash2 />
              </button>
            </div>

            {/* Status Message */}
            <div className="mt-6 text-center">
              <p
                className={`py-2 px-3 rounded-md inline-block text-sm ${error
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : isLoading
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : scanResults
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
              >
                {error ? (
                  <span className="flex items-center">
                    <FiAlertTriangle className="mr-2" /> {error}
                  </span>
                ) : (
                  <span className="flex items-center">
                    {scanResults && !isLoading && <FiCheckCircle className="mr-2" />}
                    {statusMessage}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Scan Results */}
          {scanResults && (
            <div className="section p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Scan Results</h3>
              
              {/* Download CBOM button */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    // Create CSV content
                    const headers = ['File', 'Line', 'Risk', 'Vulnerability', 'Algorithm', 'Description', 'Recommendation'];
                    const rows = scanResults.results.map((r: any) => [
                      r.file_path || 'N/A',
                      r.line_number || 'N/A',
                      r.risk_level || 'Unknown',
                      r.vulnerability_type || 'Unknown',
                      r.algorithm || 'N/A',
                      r.description || 'N/A',
                      r.recommendation || 'N/A'
                    ]);
                    const csvContent = [headers, ...rows].map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(',')).join('\n');
                    
                    // Create and download the file
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'quantum_vulnerabilities_cbom.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CBOM (CSV)
                </button>
              </div>
              
              {/* Results table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="p-3 text-left text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">File</th>
                      <th className="p-3 text-left text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Line</th>
                      <th className="p-3 text-left text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Risk</th>
                      <th className="p-3 text-left text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Vulnerability</th>
                      <th className="p-3 text-left text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Description</th>
                      <th className="p-3 text-left text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanResults.results.map((result: any, index: number) => (
                      <tr
                        key={`result-${index}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          <span className="font-mono text-xs">{result.file_path || 'N/A'}</span>
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {result.line_number || 'N/A'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                              result.risk_level === 'Critical'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : result.risk_level === 'High'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                  : result.risk_level === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                          >
                            {result.risk_level || 'Unknown'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {result.vulnerability_type || 'Unknown'}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {result.description || 'No description provided'}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {result.recommendation || 'No recommendation provided'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Render QuantumRiskAssessment component with the scan results */}
              {scanResults && scanResults.results && scanResults.results.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Quantum Risk Assessment
                  </h3>
                  <QuantumRiskAssessment findings={scanResults.results} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <img
                src="/images/logo-qvs.png"
                alt="QVS-Pro Logo"
                className="logo-qvs-footer"
              />
            </div>
            <div className="mt-4 md:mt-0 text-center md:text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Quantum Vulnerability Scanner. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Main App component with routes
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route path="/login" component={Login} />
          <ProtectedRoute path="/app" redirectTo="/login">
            <ScannerApp />
          </ProtectedRoute>
          <ProtectedRoute path="/dashboard" redirectTo="/login">
            <Dashboard />
          </ProtectedRoute>
          <ProtectedRoute path="/profile" redirectTo="/login">
            <ProfilePage />
          </ProtectedRoute>
          <Route exact path="/education" component={QuantumEducationHub} />
          <Route path="/education/shors-algorithm" component={ShorsAlgorithmDemo} />
          <Route path="/education/qubits" component={QubitVisualization} />
          <Route path="/education/post-quantum" component={PostQuantumCryptography} />
          <Route path="/education/grovers-algorithm" component={GroversAlgorithm} />
          <Route path="/education/glossary" component={QuantumGlossary} />
          <Redirect to="/" />
        </Switch>
      </Router>
    </AuthProvider>
  );
};

export default App;
