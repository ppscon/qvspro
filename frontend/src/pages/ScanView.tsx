import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiTrash2, FiAlertTriangle, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import QuantumRiskAssessment from '../components/QuantumRiskAssessment';
import { ScanRecord } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ScanView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanRecord, setScanRecord] = useState<ScanRecord | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scanData, setScanData] = useState<any | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    if (user && id) {
      fetchScanRecord();
    }
  }, [user, id]);

  const fetchScanRecord = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the scan record
      const { data, error } = await supabase
        .from('scan_records')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Scan record not found');

      setScanRecord(data);
      
      // Parse scan_parameters if it's stored as a string
      if (data.scan_parameters && typeof data.scan_parameters === 'string') {
        try {
          data.scan_parameters = JSON.parse(data.scan_parameters);
        } catch (err) {
          console.error('Error parsing scan parameters:', err);
        }
      }
      
      // Extract scan results data from the record
      if (data.results) {
        setScanData(typeof data.results === 'string' ? JSON.parse(data.results) : data.results);
      }
    } catch (error: any) {
      console.error('Error fetching scan record:', error);
      setError('Failed to load scan details');
    } finally {
      setLoading(false);
    }
  };

  // Function to restore scan data (redirect to scanner with loaded data)
  const restoreScan = () => {
    if (scanData) {
      // Store scan data in sessionStorage to be loaded by the scanner
      sessionStorage.setItem('restoredScanData', JSON.stringify(scanData));
      history.push('/app?restore=true');
    }
  };

  // Function to delete scan record
  const deleteScan = async () => {
    if (!window.confirm('Are you sure you want to delete this scan? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('scan_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      history.push('/dashboard');
    } catch (error: any) {
      console.error('Error deleting scan record:', error);
      setError(`Failed to delete scan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to export scan results as CSV
  const exportAsCSV = () => {
    if (!scanData || !scanData.results) return;

    const headers = ['File', 'Line', 'Risk', 'Vulnerability', 'Algorithm', 'Description', 'Recommendation'];
    const rows = scanData.results.map((r: any) => [
      r.file_path || r.file || 'N/A',
      r.line_number || r.line || 'N/A',
      r.risk_level || r.risk || 'Unknown',
      r.vulnerability_type || r.vulnerability || r.type || 'Unknown',
      r.algorithm || r.algorithm_name || 'N/A',
      r.description || 'N/A',
      r.recommendation || 'N/A'
    ]);
    
    const csvContent = [headers, ...rows]
      .map(e => e.map((item: string | number) => 
        `"${String(item).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `scan_${id}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="container mx-auto px-4 py-8 flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render error state
  if (error || !scanRecord) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="container mx-auto px-4 py-8 flex-grow flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center max-w-lg w-full">
            <FiAlertTriangle className="mx-auto text-red-500" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
              {error || 'Scan not found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't load the scan you're looking for. It may have been deleted or you don't have permission to view it.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Header and actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2 md:mb-0"
            >
              <FiArrowLeft className="mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {scanRecord.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {new Date(scanRecord.created_at).toLocaleString()}
            </p>
            {scanRecord.description && (
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {scanRecord.description}
              </p>
            )}
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={restoreScan}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Restore Scan
            </button>
            
            <button
              onClick={exportAsCSV}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <FiDownload className="mr-1" /> Export CSV
            </button>
            
            <button
              onClick={deleteScan}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiTrash2 className="mr-1" /> Delete
            </button>
          </div>
        </div>
        
        {/* Scan details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Scan Details
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Scan Type</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {scanRecord.scan_parameters?.scanType || 'File Scan'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${scanRecord.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      scanRecord.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}
                  >
                    {scanRecord.status}
                  </span>
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Files Scanned</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {scanRecord.scan_parameters?.fileCount || 'N/A'}
                </p>
              </div>
              
              {scanData && scanData.results && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vulnerabilities Found</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {scanData.results.length}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Quantum Risk Assessment */}
        {scanData && scanData.results && scanData.results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Quantum Risk Assessment
              </h2>
            </div>
            
            <div className="p-6">
              <QuantumRiskAssessment findings={scanData} />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ScanView; 