import React, { useState, useEffect, useRef } from 'react';
import { FiUpload, FiAlertTriangle, FiCheckCircle, FiDownload, FiSearch, FiWifi, FiLock, FiFile, FiLoader, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import QuantumRiskAssessment from './QuantumRiskAssessment';
import NetworkTrafficMap from './NetworkTrafficMap';
import TLSHandshakeVisualizer from './TLSHandshakeVisualizer';
import CertificateChainVisualizer from './CertificateChainVisualizer';

interface NetworkTrafficAnalyzerProps {
  darkMode: boolean;
}

const NetworkTrafficAnalyzer: React.FC<NetworkTrafficAnalyzerProps> = ({ darkMode }) => {
  // State variables
  const [captureMethod, setCaptureMethod] = useState<'pcap' | 'live'>('pcap');
  const [pcapFile, setPcapFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(60); // Duration in seconds for live capture
  const [interface_, setInterface] = useState<string>('');
  const [availableInterfaces, setAvailableInterfaces] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResults, setScanResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to analyze network traffic');
  const [showTlsAnalysis, setShowTlsAnalysis] = useState<boolean>(false);
  const [tlsDetailsVisible, setTlsDetailsVisible] = useState<string[]>([]);
  const { user } = useAuth();
  
  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch available network interfaces when component mounts
  useEffect(() => {
    fetchNetworkInterfaces();
  }, []);

  // Function to fetch available network interfaces
  const fetchNetworkInterfaces = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001'; // Use env var
      const response = await fetch(`${apiUrl}/api/network/interfaces`);
      if (!response.ok) {
        throw new Error(`Failed to fetch network interfaces: ${response.status}`);
      }
      const data = await response.json();
      setAvailableInterfaces(data.interfaces || []);
      if (data.interfaces && data.interfaces.length > 0) {
        setInterface(data.interfaces[0]); // Set default to first interface
      }
    } catch (err: any) {
      console.error('Error fetching network interfaces:', err);
      // Instead of setting error state, just log it and use an empty array
      setAvailableInterfaces([]);
    }
  };

  // Handle PCAP file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setPcapFile(event.target.files[0]);
      setError(null);
      setStatusMessage(`Selected file: ${event.target.files[0].name}`);
      setScanResults(null);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Toggle between PCAP file upload and live capture
  const toggleCaptureMethod = (method: 'pcap' | 'live') => {
    setCaptureMethod(method);
    // Reset related state
    setPcapFile(null);
    setScanResults(null);
    setError(null);
    setStatusMessage(`Ready to analyze ${method === 'pcap' ? 'PCAP file' : 'live network traffic'}`);
  };

  // Handle the network traffic analysis demo
  const handleNetworkDemo = async () => {
    setIsLoading(true);
    setError(null);
    setScanResults(null);
    setStatusMessage('Loading network traffic demo analysis...');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001'; // Use env var
      const response = await fetch(`${apiUrl}/api/network/demo`);
      if (!response.ok) {
        throw new Error(`Demo failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setScanResults(data);
      setStatusMessage('Demo network analysis completed successfully');
      
    } catch (err: any) {
      console.error('Error during network demo analysis:', err);
      setError(`Error: ${err.message}`);
      setStatusMessage('Demo analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the network traffic analysis
  const handleAnalyze = async () => {
    if (captureMethod === 'pcap' && !pcapFile) {
      setError('Please select a PCAP file to analyze');
      return;
    }

    if (captureMethod === 'live' && !interface_) {
      setError('Please select a network interface for live capture');
      return;
    }

    setIsLoading(true);
    setError(null);
    setScanResults(null);
    setStatusMessage(captureMethod === 'pcap' ? 'Analyzing PCAP file...' : `Capturing live traffic on ${interface_} for ${duration} seconds...`);

    try {
      let response;
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001'; // Use env var
      
      if (captureMethod === 'pcap') {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('pcap_file', pcapFile as File);
        
        // Send PCAP file to backend for analysis
        response = await fetch(`${apiUrl}/api/network/analyze-pcap`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Send live capture request to backend
        response = await fetch(`${apiUrl}/api/network/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interface: interface_,
            duration: duration,
          }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Analysis failed with status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();
      
      // Update state with results
      setScanResults(data);
      setStatusMessage(captureMethod === 'pcap' ? 'PCAP analysis completed successfully' : 'Live capture and analysis completed successfully');
    } catch (err: any) {
      console.error('Error during network analysis:', err);
      setError(`Error: ${err.message}`);
      setStatusMessage('Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle TLS handshake analysis view
  const toggleTlsAnalysis = () => {
    setShowTlsAnalysis(!showTlsAnalysis);
  };

  // Toggle visibility of a specific TLS session details
  const toggleTlsDetails = (sessionId: string) => {
    if (tlsDetailsVisible.includes(sessionId)) {
      setTlsDetailsVisible(tlsDetailsVisible.filter(id => id !== sessionId));
    } else {
      setTlsDetailsVisible([...tlsDetailsVisible, sessionId]);
    }
  };

  // Render TLS handshake analysis details
  const renderTlsHandshakeDetails = (session: any) => {
    if (!tlsDetailsVisible.includes(session.session_id)) {
      return null;
    }

    return (
      <div className="mt-2 pl-4 border-l-2 border-blue-500">
        <TLSHandshakeVisualizer handshakeData={session} darkMode={darkMode} />
        
        {/* Add Certificate Chain Visualizer if certificate data is available */}
        {session.details?.certificate && (
          <div className="mt-4">
            <CertificateChainVisualizer
              certificateData={session}
              darkMode={darkMode} 
            />
          </div>
        )}
      </div>
    );
  };

  // Render the results table
  const renderResults = () => {
    if (!scanResults || !scanResults.results || scanResults.results.length === 0) {
      return (
        <div className="text-center p-4 border rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          No scan results available. Please run a scan first.
        </div>
      );
    }

    return (
      <div>
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">Scan Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{scanResults.session_count}</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Vulnerable</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{scanResults.vulnerable_count}</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Safe</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{scanResults.safe_count}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Protocol</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Algorithm</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Risk</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Connection</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {scanResults.results.map((result: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{result.protocol}</td>
                  <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{result.algorithm}</td>
                  <td className="py-4 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      result.risk === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      result.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      result.risk === 'Low' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {result.risk}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                    <div>{result.source}</div>
                    <div className="text-gray-500 dark:text-gray-400">→ {result.destination}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                    <button
                      onClick={() => toggleTlsDetails(result.session_id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {tlsDetailsVisible.includes(result.session_id) ? 'Hide Details' : 'Show Details'}
                    </button>
                    {tlsDetailsVisible.includes(result.session_id) && renderTlsHandshakeDetails(result)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Network Traffic Analyzer</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Analyze network traffic for cryptographic protocols and algorithms vulnerable to quantum computing attacks.
      </p>

      {/* Capture method selection */}
      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          onClick={() => toggleCaptureMethod('pcap')}
          className={`flex items-center px-4 py-2 rounded-md ${captureMethod === 'pcap'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
        >
          <FiUpload className="mr-2" />
          Upload PCAP File
        </button>
        <button
          type="button"
          onClick={() => toggleCaptureMethod('live')}
          className={`flex items-center px-4 py-2 rounded-md ${captureMethod === 'live'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
        >
          <FiWifi className="mr-2" />
          Live Capture
        </button>
        <button
          type="button"
          onClick={handleNetworkDemo}
          className="flex items-center px-4 py-2 rounded-md bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          disabled={isLoading}
        >
          <FiSearch className="mr-2" />
          Demo Network Scan
        </button>
        <button
          type="button"
          onClick={toggleTlsAnalysis}
          className={`flex items-center px-4 py-2 rounded-md ${showTlsAnalysis
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
        >
          <FiLock className="mr-2" />
          TLS Handshake Analysis
        </button>
      </div>

      {/* PCAP File Selection */}
      {captureMethod === 'pcap' && !showTlsAnalysis && (
        <div className="mb-6">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pcap,.pcapng"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="text-center">
              {pcapFile ? (
                <div>
                  <FiFile className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{pcapFile.name}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {(pcapFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Click to upload a PCAP file</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    Supports .pcap and .pcapng files
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={triggerFileInput}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Capture Interface Selection */}
      {captureMethod === 'live' && !showTlsAnalysis && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Network Interface
          </label>
          <select
            value={interface_}
            onChange={(e) => setInterface(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select an interface</option>
            {availableInterfaces.map((iface) => (
              <option key={iface} value={iface}>
                {iface}
              </option>
            ))}
          </select>

          {/* Duration slider */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Capture Duration: {duration} seconds
            </label>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>10s</span>
              <span>60s</span>
              <span>120s</span>
              <span>300s</span>
            </div>
          </div>
        </div>
      )}

      {/* TLS Handshake Analysis UI */}
      {showTlsAnalysis && (
        <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">TLS Handshake Analysis</h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            This advanced feature allows you to examine TLS handshakes for quantum vulnerabilities.
            It can identify vulnerable key exchange methods, certificates, and cipher suites.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-200">Key Features</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                <li>Analyze TLS 1.2 and TLS 1.3 handshakes</li>
                <li>Identify quantum-vulnerable cryptography</li>
                <li>Detailed protocol inspection</li>
                <li>Certificate chain analysis</li>
                <li>Recommendations for quantum-safe alternatives</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-200">Vulnerable Elements</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                <li>RSA key exchange (all versions)</li>
                <li>ECDHE using NIST curves (P-256, P-384, etc.)</li>
                <li>DHE with finite field groups</li>
                <li>RSA and ECDSA certificates</li>
                <li>DSA signatures</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleNetworkDemo}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <FiSearch className="mr-2" />
              Run TLS Analysis Demo
            </button>
          </div>
          
          {/* Display TLS Handshake Visualizer when results are available */}
          {scanResults && scanResults.results && scanResults.results.length > 0 && (
            <div className="mt-8">
              {scanResults.results.filter((result: any) => result.protocol === 'TLS').map((tlsSession: any, index: number) => (
                <div key={index} className="mb-8">
                  <TLSHandshakeVisualizer 
                    handshakeData={tlsSession}
                    darkMode={darkMode}
                  />
                  
                  {/* Certificate Chain Visualization */}
                  {tlsSession.details?.certificate && (
                    <div className="mt-4">
                      <CertificateChainVisualizer
                        certificateData={tlsSession}
                        darkMode={darkMode} 
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {scanResults.results.filter((result: any) => result.protocol === 'TLS').length === 0 && (
                <div className="text-center p-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300">No TLS handshakes found in the scan results.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      {!showTlsAnalysis && (
        <div className="mb-6">
          <button
            type="button"
            onClick={handleAnalyze}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading || (captureMethod === 'pcap' && !pcapFile) || (captureMethod === 'live' && !interface_)}
          >
            {isLoading ? <FiLoader className="animate-spin mr-2" /> : <FiSearch className="mr-2" />}
            {isLoading ? 'Analyzing...' : `Analyze ${captureMethod === 'pcap' ? 'PCAP File' : 'Live Traffic'}`}
          </button>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">{statusMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          <p className="flex items-center">
            <FiAlertTriangle className="mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* Results Display */}
      {scanResults && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Scan Results</h3>
          {renderResults()}
          
          {/* Network Traffic Map */}
          <NetworkTrafficMap scanResults={scanResults} darkMode={darkMode} />
        </div>
      )}
    </div>
  );
};

export default NetworkTrafficAnalyzer; 