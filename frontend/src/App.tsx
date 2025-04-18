import React, { useState, useEffect, useRef } from 'react';
import { FiSun, FiMoon, FiSearch, FiUpload, FiFile, FiFolder, FiTrash2, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import LandingPage from './LandingPage';

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

  // Handle scan button click
  const handleScan = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to scan');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Scanning...');
    setError(null);

    try {
      const formData = new FormData();
      
      // IMPORTANT: The Flask API expects 'files[]' as the parameter name
      // This is the exact format that Flask's request.files.getlist('files[]') expects
      for (let i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
      }
      
      if (scanType === 'directory') {
        formData.append('scan_type', 'directory');
      } else {
        formData.append('scan_type', 'file');
      }
      
      console.log(`Sending ${files.length} ${scanType === 'file' ? 'files' : 'items from directory'} to API scan endpoint`);
      
      // Use direct connection to API server
      const response = await fetch('http://127.0.0.1:5001/api/scan/', {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Scan failed:', response.status, errorText);
        throw new Error(`Scan failed with status: ${response.status}. ${errorText}`);
      }
      
      // Parse successful response
      const data = await response.json();
      console.log('Scan results:', data);
      
      // Debug the structure of the vulnerability data
      if (data.results && data.results.length > 0) {
        console.log('First vulnerability structure:', JSON.stringify(data.results[0], null, 2));
        console.log('All severity values:', data.results.map((v: any) => {
          return {
            algorithm: v.algorithm || v.algorithm_name,
            risk: v.risk,
            risk_level: v.risk_level,
            severity: v.severity
          };
        }));
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
                style={{ height: '40px', width: 'auto', marginRight: '0.75rem' }}
              />
            </Link>
            <Link to="/" className="nav-link">QVS-Pro</Link>
          </h1>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/app" className="nav-link">
              Scanner
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
            {/* Scan type selection */}
            <div className="flex space-x-4 mb-6">
              <button
                type="button"
                onClick={() => toggleScanType('file')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  scanType === 'file'
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
                className={`flex items-center px-4 py-2 rounded-md ${
                  scanType === 'directory'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <FiFolder className="mr-2" />
                Directory Scan
              </button>
            </div>

            {/* File upload area */}
            <div 
              className="file-drop-area mb-6"
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
                accept={scanType === 'file' ? 
                  ".js,.py,.java,.cpp,.c,.go,.rs,.php,.rb,.cs,.ts,.swift" : 
                  undefined}
                {...(scanType === 'directory' ? { webkitdirectory: "", directory: "" } : {})}
              />
              <div className="text-center">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Click to select {scanType === 'file' ? 'files' : 'a directory'} for scanning
                </p>
                {scanType === 'file' && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Supports JavaScript, Python, Java, C++, C, Go, Rust, PHP, Ruby, C#, TypeScript, Swift
                  </p>
                )}
                {scanType === 'directory' && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Select a directory containing code files to scan recursively
                  </p>
                )}
              </div>
            </div>

            {/* Selected files display */}
            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Selected Files:</h3>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <li 
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                    >
                      <span className="truncate max-w-md">{file.name}</span>
                      <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Status message and error display */}
            <div className="mb-6">
              {statusMessage && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{statusMessage}</p>
              )}
              {error && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <FiAlertTriangle className="mr-1" /> {error}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleScan}
                disabled={isLoading || files.length === 0}
                className="scan-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              {(files.length > 0 || scanResults) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FiTrash2 className="mr-2 inline" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Results section */}
          {scanResults && (
            <div className="section p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">Scan Results</h3>
              
              {scanResults.results && scanResults.results.length > 0 ? (
                <div className="space-y-6">
                  {/* Vulnerability summary */}
                  <div className="flex items-center justify-between">
                    <p className="flex items-center text-amber-600 dark:text-amber-400">
                      <FiAlertTriangle className="mr-2" />
                      Found {scanResults.vulnerabilities_count || scanResults.results.length} potential vulnerabilities
                    </p>
                    
                    {/* Risk distribution chart */}
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const highCount = scanResults.results.filter((v: any) => 
                          (v.risk || '').toLowerCase() === 'high').length;
                        const mediumCount = scanResults.results.filter((v: any) => 
                          (v.risk || '').toLowerCase() === 'medium').length;
                        const lowCount = scanResults.results.filter((v: any) => 
                          (v.risk || '').toLowerCase() === 'low').length;
                          
                        return (
                          <>
                            <div className="flex flex-col items-center">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                                <span className="text-xs font-medium">{highCount} High</span>
                              </div>
                              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                <div 
                                  className="h-full bg-red-500" 
                                  style={{ width: `${(highCount / scanResults.results.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                                <span className="text-xs font-medium">{mediumCount} Medium</span>
                              </div>
                              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                <div 
                                  className="h-full bg-amber-500" 
                                  style={{ width: `${(mediumCount / scanResults.results.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                                <span className="text-xs font-medium">{lowCount} Low</span>
                              </div>
                              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                <div 
                                  className="h-full bg-green-500" 
                                  style={{ width: `${(lowCount / scanResults.results.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Algorithm type summary */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Vulnerability Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        // Get unique vulnerability types with proper typing
                        const vulnTypes: string[] = Array.from(new Set(scanResults.results.map((v: any) => 
                          v.vulnerability_type || (
                            ((v.type || '').toLowerCase() === 'publickey' || (v.algorithm || '').toLowerCase().includes('rsa') || (v.algorithm || '').toLowerCase().includes('ecc')) 
                              ? "Shor's Algorithm" 
                              : "Grover's Algorithm"
                          )
                        )));
                        
                        return vulnTypes.map((type: string, i: number) => {
                          const count = scanResults.results.filter((v: any) => 
                            v.vulnerability_type === type || 
                            (!v.vulnerability_type && type === "Shor's Algorithm" && 
                              ((v.type || '').toLowerCase() === 'publickey' || (v.algorithm || '').toLowerCase().includes('rsa') || (v.algorithm || '').toLowerCase().includes('ecc'))) ||
                            (!v.vulnerability_type && type === "Grover's Algorithm" && 
                              !((v.type || '').toLowerCase() === 'publickey' || (v.algorithm || '').toLowerCase().includes('rsa') || (v.algorithm || '').toLowerCase().includes('ecc')))
                          ).length;
                          
                          return (
                            <div key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                              {type} ({count})
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  
                  <div className="overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">File</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Algorithm</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk Level</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vulnerability Type</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Line</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {scanResults.results.map((vuln: any, index: number) => (
                          <>
                            <tr key={`vuln-${index}`} className="group hover:bg-gray-50 dark:hover:bg-gray-800/70 cursor-pointer" 
                                onClick={() => {
                                  // Toggle expanded details
                                  const expandedDetails = document.getElementById(`details-${index}`);
                                  if (expandedDetails) {
                                    expandedDetails.classList.toggle('hidden');
                                  }
                                }}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                                {vuln.file_path || vuln.file}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {vuln.algorithm_name || vuln.algorithm}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {(() => {
                                  const risk = vuln.risk || vuln.risk_level || vuln.severity || 'unknown';
                                  const isHigh = risk.toLowerCase() === 'high';
                                  const isMedium = risk.toLowerCase() === 'medium';
                                  const isLow = !isHigh && !isMedium;
                                  
                                  // Direct inline styles based on risk level - more elegant with transparency
                                  const badgeStyle = {
                                    display: 'inline-block',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    border: '1px solid',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                    ...(isHigh
                                      ? {
                                          color: darkMode ? '#ef4444' : '#b91c1c',
                                          backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 226, 226, 0.8)',
                                          borderColor: darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(248, 113, 113, 0.3)'
                                        }
                                      : isMedium
                                      ? {
                                          color: darkMode ? '#f59e0b' : '#92400e',
                                          backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(254, 243, 199, 0.8)',
                                          borderColor: darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(251, 191, 36, 0.3)'
                                        }
                                      : {
                                          color: darkMode ? '#10b981' : '#065f46',
                                          backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(209, 250, 229, 0.8)',
                                          borderColor: darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(52, 211, 153, 0.3)'
                                        })
                                  };
                                  
                                  return (
                                    <span style={badgeStyle}>
                                      {risk}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {vuln.vulnerability_type || (
                                  ((vuln.type || '').toLowerCase() === 'publickey' || (vuln.algorithm || '').toLowerCase().includes('rsa') || (vuln.algorithm || '').toLowerCase().includes('ecc')) 
                                    ? "Shor's Algorithm" 
                                    : "Grover's Algorithm"
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {vuln.line_number || vuln.line}
                              </td>
                            </tr>
                            
                            {/* Expandable details row */}
                            <tr key={`details-${index}`} id={`details-${index}`} className="hidden">
                              <td colSpan={5} className="px-6 py-4">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                  <div className="mb-3">
                                    <h4 className="text-sm font-semibold mb-1">Description</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {vuln.description || (
                                        vuln.vulnerability_type === "Shor's Algorithm" || 
                                        ((vuln.type || '').toLowerCase() === 'publickey' || (vuln.algorithm || '').toLowerCase().includes('rsa') || (vuln.algorithm || '').toLowerCase().includes('ecc'))
                                          ? `${vuln.algorithm} is a public-key cryptographic algorithm vulnerable to quantum attacks using Shor's algorithm, which can break the underlying mathematical problem in polynomial time.`
                                          : `${vuln.algorithm} with insufficient key size is vulnerable to quantum speed-up attacks using Grover's algorithm, which can reduce effective security by half.`
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold mb-1">Recommendation</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {vuln.recommendation || (
                                        vuln.vulnerability_type === "Shor's Algorithm" || 
                                        ((vuln.type || '').toLowerCase() === 'publickey' || (vuln.algorithm || '').toLowerCase().includes('rsa') || (vuln.algorithm || '').toLowerCase().includes('ecc'))
                                          ? "Replace with NIST-standardized post-quantum cryptography like ML-KEM (CRYSTALS-Kyber) for encryption or ML-DSA (CRYSTALS-Dilithium) for digital signatures."
                                          : "Increase key size to at least 256 bits to maintain adequate security margin against quantum attacks."
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiCheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-gray-100">No vulnerabilities found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your code appears to be free from known quantum-vulnerable cryptographic algorithms</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <footer className="footer" style={{ backgroundColor: darkMode ? '#1f2937' : '#f3f4f6', color: darkMode ? '#9ca3af' : '#6b7280', padding: '1.5rem 0', marginTop: 'auto', textAlign: 'center' }}>
        <div className="container">
          <div className="flex items-center justify-center mb-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <img 
              src="/images/logo-qvs.png"
              alt="QVS-Pro Logo" 
              className="logo-qvs-footer"
              style={{ height: '30px', width: 'auto', marginRight: '0.5rem' }}
            />
            <span className="heading" style={{ fontSize: '1.5rem', fontWeight: 600 }}>QVS-Pro</span>
          </div>
          <p>Quantum Vulnerability Scanner Pro &copy; {new Date().getFullYear()}</p>
          <p className="mt-4" style={{ marginTop: '1rem' }}>Scan your code for quantum-vulnerable cryptographic algorithms</p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/app" component={ScannerApp} />
      </Switch>
    </Router>
  );
};

export default App;
