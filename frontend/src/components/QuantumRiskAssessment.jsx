// Checklist for React runtime errors:
// - Ensure only one version of React and react-dom is installed (npm ls react)
// - If errors persist, delete node_modules and package-lock.json, then run npm install
// - All table rows and mapped children must have a unique key prop
// - Never render React elements or arrays directly as table cell values

import React, { useState, useMemo, useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

// Simple Search icon SVG component (no external dependencies)
const SearchIcon = ({ size = 18, className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// Download icon
const DownloadIcon = ({ size = 18, className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

// Filter icon
const FilterIcon = ({ size = 18, className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

function safeCell(val) {
  console.log('[safeCell] Input:', val, '(type:', typeof val, ')'); // Keep logging
  // Return value directly if it exists, otherwise return empty string
  if (val == null || val === undefined || val === '') {
    return '';
  }
  return String(val);
}

function uniqueRowKey(f, i) {
  // Use file_path/file, algorithm, line, and index for uniqueness
  return [safeCell(f.file_path), safeCell(f.file), safeCell(f.algorithm_name || f.algorithm), safeCell(f.line_number || f.line), i].filter(Boolean).join('::');
}

// Main component
const QuantumRiskAssessment = ({ findings }) => {
  // console.log('QuantumRiskAssessment received findings:', findings); // REMOVE LOG
  
  // State for search and filtering
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [algorithmFilter, setAlgorithmFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(true);
  
  // State for filtered findings
  const [filteredResults, setFilteredResults] = useState([]);
  
  useEffect(() => {
    // Check if dark mode is enabled in the document
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
    
    // Listen for changes to the dark mode class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);
  
  // Process and sanitize the findings data
  const results = useMemo(() => {
    // Handle different formats of input data
    let findingsArray = [];
    
    if (!findings) {
      console.warn('No findings data provided');
      return [];
    }
    
    // Handle both formats: direct array or {results: [...]} object
    if (Array.isArray(findings)) {
      findingsArray = findings;
    } else if (findings.results && Array.isArray(findings.results)) {
      findingsArray = findings.results;
    } else {
      console.warn('Findings data is not in expected format', findings);
      return [];
    }
    
    try {
      // Sanitize and ensure data consistency
      return findingsArray.map(item => {
        // Ensure item is an object
        if (typeof item !== 'object' || item === null) {
          return {
            file: 'N/A',
            line: 'N/A',
            risk: 'Unknown',
            vulnerability: 'Unknown',
            description: 'No description provided',
            recommendation: 'No recommendation provided'
          };
        }
        
        // The key properties from the backend may have different names
        // Check multiple possible property names with specific fallbacks
        return {
          file: item.file || item.file_path || 'N/A',
          line: item.line || item.line_number || 'N/A',
          risk: item.risk || item.risk_level || 'Unknown',
          vulnerability: item.type || item.vulnerability_type || item.vulnerability || 'Unknown',
          algorithm: item.algorithm || item.algorithm_name || 'Unknown',
          method: item.method || '',
          description: item.description || `${item.algorithm || ''} ${item.method || ''} vulnerability` || 'No description provided',
          recommendation: item.recommendation || (item.risk === 'High' ? 
            'Replace with post-quantum cryptography algorithm' : 
            item.risk === 'Medium' ? 
            'Plan to upgrade to stronger cryptography' : 
            'Monitor for vulnerabilities') || 'No recommendation provided'
        };
      });
    } catch (error) {
      console.error('Error processing findings:', error);
      return [];
    }
  }, [findings]);

  // Filtered findings
  useEffect(() => {
    let filtered = [...results];
    
    if (search) {
      const lowercaseSearch = search.toLowerCase();
      filtered = filtered.filter(item => {
        return (
          (item.file && item.file.toLowerCase().includes(lowercaseSearch)) ||
          (item.algorithm && item.algorithm.toLowerCase().includes(lowercaseSearch)) ||
          (item.description && item.description.toLowerCase().includes(lowercaseSearch)) ||
          (item.recommendation && item.recommendation.toLowerCase().includes(lowercaseSearch))
        );
      });
    }
    
    if (riskFilter !== 'all') {
      filtered = filtered.filter(item => item.risk && item.risk.toLowerCase() === riskFilter.toLowerCase());
    }
    
    if (algorithmFilter !== 'all') {
      filtered = filtered.filter(item => item.algorithm && item.algorithm === algorithmFilter);
    }
    
    setFilteredResults(filtered);
  }, [results, search, riskFilter, algorithmFilter]);

  // Risk distribution data
  const riskData = useMemo(() => {
    const riskCounts = {};
    results.forEach(item => {
      const risk = item.risk || 'Unknown';
      riskCounts[risk] = (riskCounts[risk] || 0) + 1;
    });
    
    return Object.entries(riskCounts).map(([name, value]) => ({ name, value }));
  }, [results]);
  
  // Unique algorithms
  const uniqueAlgorithms = useMemo(() => {
    const algorithms = new Set();
    results.forEach(item => {
      if (item.algorithm && typeof item.algorithm === 'string') {
        algorithms.add(item.algorithm);
      }
    });
    return Array.from(algorithms);
  }, [results]);
  
  // Algorithm hotspots data
  const algoData = useMemo(() => {
    const algoCounts = {};
    results.forEach(item => {
      const algo = item.algorithm || 'Unknown';
      algoCounts[algo] = (algoCounts[algo] || 0) + 1;
    });
    return Object.entries(algoCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 algorithms
  }, [results]);

  // Calculate chart data using useMemo based on the processed results
  const pieChartData = useMemo(() => {
    const categories = {};
    results.forEach(finding => {
      const type = finding.algorithm || 'Unknown'; // Use the algorithm field consistently
      categories[type] = (categories[type] || 0) + 1;
    });
    // Ensure at least 3 categories for visualization (optional, adjust as needed)
    if (Object.keys(categories).length < 3) {
      if (!categories["RSA"]) categories["RSA"] = 0;
      if (!categories["AES-128"]) categories["AES-128"] = 0;
      if (!categories["ECC"]) categories["ECC"] = 0;
    }
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [results]);

  const barChartData = useMemo(() => {
    // Use algoData directly as it's already calculated with useMemo
    return algoData;
  }, [algoData]);

  // Risk level data for pie chart
  const hasRiskData = riskData.some(d => d.value > 0);

  // Algorithm data for bar chart
  const hasAlgoData = algoData.length > 0 && algoData.some(d => d.value > 0);

  // Vulnerability categories
  const vulnTypes = useMemo(() => {
    const types = {};
    results.forEach(item => {
      const type = item.vulnerability || 'Unknown';
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }, [results]);
  
  // Executive summary metrics
  const totalVulnerabilities = results.length;
  
  const highRiskCount = useMemo(() => 
    results.filter(item => item.risk && item.risk.toLowerCase() === 'high').length,
  [results]);
  
  const highRiskPercentage = useMemo(() => 
    totalVulnerabilities > 0 ? Math.round((highRiskCount / totalVulnerabilities) * 100) : 0,
  [highRiskCount, totalVulnerabilities]);
  
  const mostCommonAlgo = useMemo(() => {
    if (algoData.length === 0) return 'None Found';
    return algoData[0].name;
  }, [algoData]);

  // Vulnerability types - redesigned to better categorize
  const vulnTypesRedesigned = {};
  results.forEach(r => {
    // Determine vulnerability type with improved categorization
    let vulnType = safeCell(r.vulnerability_type);
    
    if (!vulnType || vulnType === '') {
      const algo = (safeCell(r.algorithm) || '').toLowerCase();
      const type = (safeCell(r.type) || '').toLowerCase();
      
      if (type === 'publickey' || algo.includes('rsa') || algo.includes('ecc') || algo.includes('dsa')) {
        vulnType = "Shor's Algorithm";
      } else if (algo.includes('aes') || algo.includes('des') || algo.includes('blowfish')) {
        vulnType = "Symmetric Key";
      } else if (algo.includes('sha') || algo.includes('md5') || algo.includes('hash')) {
        vulnType = "Hash Function";
      } else {
        vulnType = "Grover's Algorithm";
      }
    }
    
    vulnTypesRedesigned[vulnType] = (vulnTypesRedesigned[vulnType] || 0) + 1;
  });
  
  // Ensure we have at least 3 categories even with demo data
  if (Object.keys(vulnTypesRedesigned).length < 3) {
    if (!vulnTypesRedesigned["Shor's Algorithm"]) vulnTypesRedesigned["Shor's Algorithm"] = 0;
    if (!vulnTypesRedesigned["Grover's Algorithm"]) vulnTypesRedesigned["Grover's Algorithm"] = 0;
    if (!vulnTypesRedesigned["Symmetric Key"]) vulnTypesRedesigned["Symmetric Key"] = 0;
  }
  
  // Prepare radar data
  const radarData = Object.keys(vulnTypesRedesigned).map(type => ({
    subject: type,
    A: vulnTypesRedesigned[type],
    fullMark: Math.max(...Object.values(vulnTypesRedesigned))
  }));

  // Time projection data (simulated)
  const timelineData = [
    { name: 'Now', risk: 100 },
    { name: '1 year', risk: 110 },
    { name: '2 years', risk: 130 },
    { name: '5 years', risk: 175 },
    { name: '10 years', risk: 240 },
  ];

  // Export to PDF (placeholder function)
  const exportToPDF = () => {
    alert('Export to PDF functionality would be implemented here. This would generate a comprehensive report of all findings.');
  };

  // Export to CSV
  const exportToCSV = () => {
    // Basic CSV export implementation
    const headers = ['File', 'Algorithm', 'Risk', 'Vulnerability Type', 'Line', 'Description', 'Recommendation'];
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(f => [
        safeCell(f.file_path || f.file),
        safeCell(f.algorithm_name || f.algorithm),
        safeCell(f.risk),
        safeCell(f.vulnerability_type),
        safeCell(f.line_number || f.line),
        `"${safeCell(f.description).replace(/"/g, '""')}"`,
        `"${safeCell(f.recommendation).replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'quantum_risk_assessment.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Log debug info at render time - useful for debugging
  console.log('[Render Scope] filteredResults:', filteredResults);
  console.log('Table data:', filteredResults);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quantum Risk Assessment</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Toggle filters"
          >
            <FilterIcon />
          </button>
          <button 
            onClick={exportToPDF}
            className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
            title="Export as PDF report"
          >
            <DownloadIcon className="mr-1" /> PDF
          </button>
          <button 
            onClick={exportToCSV}
            className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
            title="Export as CSV"
          >
            <DownloadIcon className="mr-1" /> CSV
          </button>
        </div>
      </div>

      {/* Executive summary - "Quantum Exposure Index" */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg">
            <p className="text-xs text-indigo-600 dark:text-indigo-300 uppercase font-semibold">Total Vulnerabilities</p>
            <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{totalVulnerabilities}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-300 uppercase font-semibold">High Risk Issues</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-400">{highRiskCount} <span className="text-sm font-normal">({highRiskPercentage}%)</span></p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
            <p className="text-xs text-amber-600 dark:text-amber-300 uppercase font-semibold">Most Common Algorithm</p>
            <p className="text-xl font-bold text-amber-700 dark:text-amber-400 truncate" title={mostCommonAlgo}>{mostCommonAlgo}</p>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <h3 className="font-semibold mb-3">Filter Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Risk Level</label>
              <select 
                value={riskFilter} 
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Algorithm</label>
              <select 
                value={algorithmFilter} 
                onChange={(e) => setAlgorithmFilter(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All Algorithms</option>
                {uniqueAlgorithms.map((algo, i) => (
                  <option key={i} value={algo}>{algo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search findings..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full p-2 pl-8 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <SearchIcon className="absolute left-2 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Always render the findings section */} 
      <div className="pt-2">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredResults.length} of {results.length} findings
            {filteredResults.length !== results.length && " (filtered)"}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[25%] max-w-[25%]">File</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[7%]">Line</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[8%]">Risk</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[12%]">Vulnerability</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">Algorithm</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[19%]">Description</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[19%]">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                      {results.length > 0 ? 'No findings match your filters.' : 'No findings available.'}
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((item, index) => { 
                    console.log('[Table Map] Rendering row', index, ':', item);
                    const rowKey = `finding-${index}-${item.file || ''}-${item.line || ''}`;
                    
                    // Determine risk class
                    let riskClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                    if (item.risk) {
                      const risk = item.risk.toLowerCase();
                      if (risk === 'high' || risk === 'critical') {
                        riskClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
                      } else if (risk === 'medium') {
                        riskClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
                      } else if (risk === 'low') {
                        riskClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
                      }
                    }
                    
                    // Generate description and recommendation explicitly to avoid issues
                    let description = 'No description available';
                    if (item.description && item.description !== 'No description provided') {
                      description = item.description;
                    } else if (item.algorithm || item.method) {
                      description = `${item.algorithm || ''} ${item.method || ''} vulnerability`.trim();
                    }
                    
                    let recommendation = 'No recommendation available';
                    if (item.recommendation && item.recommendation !== 'No recommendation provided') {
                      recommendation = item.recommendation;
                    } else if (item.risk) {
                      if (item.risk === 'High' || item.risk === 'Critical') {
                        recommendation = 'Replace with post-quantum cryptography algorithm';
                      } else if (item.risk === 'Medium') {
                        recommendation = 'Plan to upgrade to stronger cryptography';
                      } else {
                        recommendation = 'Monitor for vulnerabilities';
                      }
                    }

                    // For debugging
                    console.log(`Row ${index}:`, {
                      file: item.file || item.file_path || 'N/A', 
                      line: item.line || item.line_number || 'N/A',
                      risk: item.risk || 'Unknown',
                      vulnerability: item.vulnerability || item.type || item.vulnerability_type || 'Unknown',
                      algorithm: item.algorithm || item.algorithm_name || 'Unknown',
                      description,
                      recommendation
                    });

                    return (
                      <tr key={rowKey} className="bg-white dark:bg-gray-900 even:bg-gray-50 dark:even:bg-gray-800">
                        <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-300 font-mono w-[25%] max-w-[25%] truncate">
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {item.file || item.file_path || 'N/A'}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-300 w-[7%]">
                          {item.line || item.line_number || 'N/A'}
                        </td>
                        <td className="px-3 py-4 w-[8%]">
                          <span className={`px-2 py-1 text-xs rounded ${riskClass}`}>
                            {item.risk || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-300 w-[12%] truncate">
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {item.vulnerability || item.type || item.vulnerability_type || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-300 w-[10%] truncate">
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {item.algorithm || item.algorithm_name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-300 w-[19%] truncate">
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {description}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-700 dark:text-gray-300 w-[19%] truncate">
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {recommendation}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}

export default QuantumRiskAssessment; 