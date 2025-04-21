import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ScanRecord } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface ScanCompareParams {
  scan1Id: string;
  scan2Id: string;
}

interface FindingComparison {
  file: string;
  line?: number;
  risk: string;
  vulnerability: string;
  algorithm: string;
  status: 'new' | 'fixed' | 'unchanged'; // 'new' means in scan2 but not scan1, 'fixed' means in scan1 but not scan2
}

const ScanCompare: React.FC = () => {
  const { scan1Id, scan2Id } = useParams<ScanCompareParams>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scan1, setScan1] = useState<ScanRecord | null>(null);
  const [scan2, setScan2] = useState<ScanRecord | null>(null);
  const [scan1Data, setScan1Data] = useState<any | null>(null);
  const [scan2Data, setScan2Data] = useState<any | null>(null);
  const [comparisonResults, setComparisonResults] = useState<FindingComparison[]>([]);
  const [stats, setStats] = useState({
    new: 0,
    fixed: 0,
    unchanged: 0,
    total1: 0,
    total2: 0,
  });
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    if (user && scan1Id && scan2Id) {
      fetchScanRecords();
    }
  }, [user, scan1Id, scan2Id]);

  useEffect(() => {
    if (scan1Data && scan2Data) {
      compareScans();
    }
  }, [scan1Data, scan2Data]);

  const fetchScanRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the first scan record
      const { data: data1, error: error1 } = await supabase
        .from('scan_records')
        .select('*')
        .eq('id', scan1Id)
        .eq('user_id', user?.id)
        .single();

      if (error1) throw error1;
      if (!data1) throw new Error('First scan record not found');

      // Fetch the second scan record
      const { data: data2, error: error2 } = await supabase
        .from('scan_records')
        .select('*')
        .eq('id', scan2Id)
        .eq('user_id', user?.id)
        .single();

      if (error2) throw error2;
      if (!data2) throw new Error('Second scan record not found');

      setScan1(data1);
      setScan2(data2);
      
      // Parse scan_parameters if stored as strings
      if (data1.scan_parameters && typeof data1.scan_parameters === 'string') {
        try {
          data1.scan_parameters = JSON.parse(data1.scan_parameters);
        } catch (err) {
          console.error('Error parsing scan1 parameters:', err);
        }
      }
      
      if (data2.scan_parameters && typeof data2.scan_parameters === 'string') {
        try {
          data2.scan_parameters = JSON.parse(data2.scan_parameters);
        } catch (err) {
          console.error('Error parsing scan2 parameters:', err);
        }
      }
      
      // Extract scan results data from the records
      if (data1.results) {
        setScan1Data(typeof data1.results === 'string' ? JSON.parse(data1.results) : data1.results);
      }
      
      if (data2.results) {
        setScan2Data(typeof data2.results === 'string' ? JSON.parse(data2.results) : data2.results);
      }
    } catch (error: any) {
      console.error('Error fetching scan records:', error);
      setError(`Failed to load scan details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to compare two scan results
  const compareScans = () => {
    if (!scan1Data?.results || !scan2Data?.results) {
      setError('Cannot compare scans: missing results data');
      return;
    }

    const results1 = scan1Data.results || [];
    const results2 = scan2Data.results || [];
    
    // Create a map of findings from scan1 for easy lookup
    const scan1Map = new Map();
    results1.forEach((result: any) => {
      const key = getFindingKey(result);
      scan1Map.set(key, result);
    });
    
    // Create a map of findings from scan2 for easy lookup
    const scan2Map = new Map();
    results2.forEach((result: any) => {
      const key = getFindingKey(result);
      scan2Map.set(key, result);
    });
    
    const comparisonResults: FindingComparison[] = [];
    
    // Find unchanged and fixed findings
    scan1Map.forEach((result, key) => {
      const status = scan2Map.has(key) ? 'unchanged' : 'fixed';
      comparisonResults.push(createComparisonFinding(result, status));
    });
    
    // Find new findings
    scan2Map.forEach((result, key) => {
      if (!scan1Map.has(key)) {
        comparisonResults.push(createComparisonFinding(result, 'new'));
      }
    });
    
    // Sort by status and then by file
    comparisonResults.sort((a, b) => {
      if (a.status !== b.status) {
        // Sort by status: new -> fixed -> unchanged
        if (a.status === 'new') return -1;
        if (b.status === 'new') return 1;
        if (a.status === 'fixed') return -1;
        if (b.status === 'fixed') return 1;
      }
      // Then sort by file path
      return a.file.localeCompare(b.file);
    });
    
    setComparisonResults(comparisonResults);
    
    // Calculate statistics
    const newFindings = comparisonResults.filter(f => f.status === 'new').length;
    const fixedFindings = comparisonResults.filter(f => f.status === 'fixed').length;
    const unchangedFindings = comparisonResults.filter(f => f.status === 'unchanged').length;
    
    setStats({
      new: newFindings,
      fixed: fixedFindings,
      unchanged: unchangedFindings,
      total1: results1.length,
      total2: results2.length,
    });
  };
  
  // Function to create a unique key for a finding
  const getFindingKey = (finding: any) => {
    const file = finding.file_path || finding.file || '';
    const line = finding.line_number || finding.line || '';
    const algo = finding.algorithm || finding.algorithm_name || '';
    return `${file}:${line}:${algo}`;
  };
  
  // Function to create a comparison finding object
  const createComparisonFinding = (finding: any, status: 'new' | 'fixed' | 'unchanged'): FindingComparison => {
    return {
      file: finding.file_path || finding.file || 'N/A',
      line: finding.line_number || finding.line,
      risk: finding.risk_level || finding.risk || 'Unknown',
      vulnerability: finding.vulnerability_type || finding.vulnerability || finding.type || 'Unknown',
      algorithm: finding.algorithm || finding.algorithm_name || 'Unknown',
      status,
    };
  };

  // Function to export comparison as CSV
  const exportAsCSV = () => {
    if (!comparisonResults.length) return;

    const headers = ['File', 'Line', 'Risk', 'Vulnerability', 'Algorithm', 'Status'];
    const rows = comparisonResults.map(r => [
      r.file,
      r.line || 'N/A',
      r.risk,
      r.vulnerability,
      r.algorithm,
      r.status.charAt(0).toUpperCase() + r.status.slice(1) // Capitalize status
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
    link.setAttribute('download', `scan_comparison_${scan1Id}_${scan2Id}.csv`);
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
  if (error || !scan1 || !scan2) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="container mx-auto px-4 py-8 flex-grow flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center max-w-lg w-full">
            <FiAlertTriangle className="mx-auto text-red-500" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
              {error || 'Scans not found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't load the scans you're trying to compare. They may have been deleted or you don't have permission to view them.
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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2 md:mb-0"
            >
              <FiArrowLeft className="mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Scan Comparison
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comparing findings between two scans
            </p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={exportAsCSV}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <FiDownload className="mr-1" /> Export CSV
            </button>
          </div>
        </div>

        {/* Scan metadata comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Scan Details
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">
                {scan1.name}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                  {new Date(scan1.created_at).toLocaleString()}
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    scan1.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {scan1.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Files Scanned:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {scan1.scan_parameters?.fileCount || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Findings:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {stats.total1}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">
                {scan2.name}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                  {new Date(scan2.created_at).toLocaleString()}
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    scan2.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {scan2.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Files Scanned:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {scan2.scan_parameters?.fileCount || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Findings:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {stats.total2}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Comparison Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Comparison Summary
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200 uppercase">Fixed Vulnerabilities</h3>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{stats.fixed}</p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  Vulnerabilities found in the first scan but not in the second
                </p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 uppercase">New Vulnerabilities</h3>
                <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{stats.new}</p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Vulnerabilities found in the second scan but not in the first
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 uppercase">Unchanged Vulnerabilities</h3>
                <p className="mt-2 text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.unchanged}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Vulnerabilities found in both scans
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Comparison Results Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Detailed Comparison
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            {comparisonResults.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No comparison data available
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Line</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Algorithm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vulnerability</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {comparisonResults.map((finding, index) => (
                    <tr 
                      key={index}
                      className={
                        finding.status === 'new' ? 'bg-red-50 dark:bg-red-900/20' : 
                        finding.status === 'fixed' ? 'bg-green-50 dark:bg-green-900/20' : 
                        ''
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full
                          ${finding.status === 'new' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            finding.status === 'fixed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {finding.status.charAt(0).toUpperCase() + finding.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                        {finding.file}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {finding.line || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full
                          ${finding.risk === 'High' || finding.risk === 'Critical' ? 
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            finding.risk === 'Medium' ? 
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          }`}
                        >
                          {finding.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {finding.algorithm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {finding.vulnerability}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ScanCompare; 