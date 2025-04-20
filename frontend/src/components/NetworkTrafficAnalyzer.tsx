import React, { useState, useEffect, useRef } from 'react';
import { FiUpload, FiAlertTriangle, FiCheckCircle, FiDownload, FiSearch, FiWifi } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import QuantumRiskAssessment from './QuantumRiskAssessment';

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
      const response = await fetch('http://127.0.0.1:5001/api/network/interfaces');
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
      const response = await fetch('http://127.0.0.1:5001/api/network/demo');
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
      
      if (captureMethod === 'pcap') {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('pcap_file', pcapFile as File);
        
        // Send PCAP file to backend for analysis
        response = await fetch('http://127.0.0.1:5001/api/network/analyze-pcap', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Send live capture request to backend
        response = await fetch('http://127.0.0.1:5001/api/network/capture', {
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

  // Function to save scan results
  const saveScanResults = async () => {
    if (!scanResults || !user) return;
    
    setStatusMessage('Saving scan results...');
    
    try {
      const scanRecord = {
        user_id: user.id,
        name: captureMethod === 'pcap' ? (pcapFile?.name || 'PCAP Analysis') : `Network Capture - ${new Date().toLocaleString()}`,
        description: captureMethod === 'pcap' ? 
          `Analysis of PCAP file: ${pcapFile?.name}` : 
          `Live capture on interface ${interface_} for ${duration} seconds`,
        scan_parameters: JSON.stringify({
          scanType: 'network',
          captureMethod,
          interface: captureMethod === 'live' ? interface_ : null,
          duration: captureMethod === 'live' ? duration : null,
          pcapFile: captureMethod === 'pcap' ? pcapFile?.name : null,
        }),
        status: 'completed',
        results: scanResults
      };
      
      const { error } = await supabase
        .from('scan_records')
        .insert([scanRecord]);
        
      if (error) throw error;
      
      setStatusMessage('Scan results saved successfully');
    } catch (err: any) {
      console.error('Error saving scan results:', err);
      setError(`Failed to save scan results: ${err.message}`);
      setStatusMessage('Error saving scan results');
    }
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
      </div>

      {/* PCAP File Selection */}
      {captureMethod === 'pcap' && (
        <div className="mb-6">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500"
            onClick={triggerFileInput}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pcap,.pcapng"
              className="hidden"
              onChange={handleFileChange}
            />
            <FiUpload className="mx-auto mb-4 text-gray-400 dark:text-gray-600" size={32} />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {pcapFile
                ? `Selected file: ${pcapFile.name} (${(pcapFile.size / 1024 / 1024).toFixed(2)} MB)`
                : 'Click to select or drag and drop a PCAP file here'}
            </p>
            <button
              type="button"
              className="mt-2 px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Select PCAP File
            </button>
          </div>
        </div>
      )}

      {/* Live Capture Settings */}
      {captureMethod === 'live' && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Network Interface
            </label>
            <select
              value={interface_}
              onChange={(e) => setInterface(e.target.value)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              {availableInterfaces.length > 0 ? (
                availableInterfaces.map((iface, index) => (
                  <option key={index} value={iface}>
                    {iface}
                  </option>
                ))
              ) : (
                <option value="">No interfaces available</option>
              )}
            </select>
            {availableInterfaces.length === 0 && (
              <p className="mt-1 text-sm text-yellow-500">
                Network interfaces could not be detected. This feature may require desktop application privileges.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Capture Duration (seconds)
            </label>
            <input
              type="number"
              min={10}
              max={3600}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex mb-6">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading || (captureMethod === 'pcap' && !pcapFile) || (captureMethod === 'live' && !interface_)}
          className="flex-1 flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {captureMethod === 'pcap' ? 'Analyzing...' : 'Capturing...'}
            </>
          ) : (
            <>
              <FiSearch className="mr-2" />
              {captureMethod === 'pcap' ? 'Analyze PCAP' : 'Start Capture & Analysis'}
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      <div className="mb-6 text-center">
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

      {/* Scan Results */}
      {scanResults && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Analysis Results</h3>
            <div className="flex space-x-2">
              <button
                onClick={saveScanResults}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Save Results
              </button>
              <button
                onClick={() => {
                  // Create CSV content
                  const headers = ['Protocol', 'Algorithm', 'Risk', 'Vulnerability', 'Source', 'Destination', 'Description', 'Recommendation'];
                  const rows = scanResults.results.map((r: any) => [
                    r.protocol || 'N/A',
                    r.algorithm || 'N/A',
                    r.risk || 'Unknown',
                    r.vulnerability_type || 'Unknown',
                    r.source || 'N/A',
                    r.destination || 'N/A',
                    r.description || 'N/A',
                    r.recommendation || 'N/A'
                  ]);
                  const csvContent = [headers, ...rows].map(e => e.map((item: string | number) => `"${String(item).replace(/"/g, '""')}"`).join(',')).join('\n');
                  
                  // Create and download the file
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.setAttribute('href', url);
                  link.setAttribute('download', 'network_crypto_analysis.csv');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                <FiDownload className="mr-2" /> Export CSV
              </button>
            </div>
          </div>

          {/* Summary Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Total Cryptographic Sessions</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{scanResults.session_count || scanResults.results?.length || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Vulnerable Sessions</h4>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{scanResults.vulnerable_count || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Quantum-Safe Sessions</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{scanResults.safe_count || 0}</p>
            </div>
          </div>

          {/* Analysis Results */}
          {scanResults && scanResults.results && scanResults.results.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">Detailed Analysis</h4>
              <QuantumRiskAssessment findings={scanResults} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkTrafficAnalyzer; 