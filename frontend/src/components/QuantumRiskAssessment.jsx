// Checklist for React runtime errors:
// - Ensure only one version of React and react-dom is installed (npm ls react)
// - If errors persist, delete node_modules and package-lock.json, then run npm install
// - All table rows and mapped children must have a unique key prop
// - Never render React elements or arrays directly as table cell values

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, CartesianGrid, Legend } from 'recharts';

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

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];
const RADAR_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'];
const VULN_CATEGORY_COLORS = {
  "Shor's Algorithm": { bg: '#8b5cf6', text: '#ffffff' },
  "Grover's Algorithm": { bg: '#ec4899', text: '#ffffff' },
  "Symmetric Key": { bg: '#14b8a6', text: '#ffffff' },
  "Public Key": { bg: '#f97316', text: '#ffffff' },
  "Hash Function": { bg: '#6366f1', text: '#ffffff' }
};

function safeCell(val) {
  if (val == null) return '';
  if (Array.isArray(val)) return val.map(safeCell).join(', ');
  if (React.isValidElement(val)) {
    // Debug log for React elements in data
    // eslint-disable-next-line no-console
    console.warn('React element found in scan result field:', val);
    return '[React Element]';
  }
  if (typeof val === 'object') {
    // Handle error objects from sanitization
    if (val.error) {
      console.warn('Error object found in scan result field:', val);
      return val.data ? `Error: ${val.error} (${val.data})` : `Error: ${val.error}`;
    }
    // Debug log for objects in data
    // eslint-disable-next-line no-console
    console.warn('Object found in scan result field:', val);
    return JSON.stringify(val);
  }
  return String(val);
}

function uniqueRowKey(f, i) {
  // Use file_path/file, algorithm, line, and index for uniqueness
  return [safeCell(f.file_path), safeCell(f.file), safeCell(f.algorithm_name || f.algorithm), safeCell(f.line_number || f.line), i].filter(Boolean).join('::');
}

// Main component
const QuantumRiskAssessment = ({ findings }) => {
  const [results] = useState(findings || []);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [riskFilter, setRiskFilter] = useState('all');
  const [algorithmFilter, setAlgorithmFilter] = useState('all');

  // Filtered findings
  const filtered = useMemo(() => {
    return results.filter(f => {
      // Text search
      const matchesSearch = 
        safeCell(f.algorithm).toLowerCase().includes(search.toLowerCase()) ||
        safeCell(f.risk).toLowerCase().includes(search.toLowerCase()) ||
        safeCell(f.file_path || f.file).toLowerCase().includes(search.toLowerCase()) ||
        safeCell(f.vulnerability_type).toLowerCase().includes(search.toLowerCase());
      
      // Risk level filter
      const matchesRisk = riskFilter === 'all' || 
        safeCell(f.risk).toLowerCase() === riskFilter.toLowerCase();
      
      // Algorithm filter
      const algo = safeCell(f.algorithm_name || f.algorithm || '').toLowerCase();
      const matchesAlgorithm = algorithmFilter === 'all' || 
        algo.includes(algorithmFilter.toLowerCase());
      
      return matchesSearch && matchesRisk && matchesAlgorithm;
    });
  }, [results, search, riskFilter, algorithmFilter]);

  // Risk level data for pie chart
  const riskData = [
    { name: 'High', value: results.filter(r => safeCell(r.risk).toLowerCase() === 'high').length },
    { name: 'Medium', value: results.filter(r => safeCell(r.risk).toLowerCase() === 'medium').length },
    { name: 'Low', value: results.filter(r => safeCell(r.risk).toLowerCase() === 'low').length },
  ].filter(d => typeof d.value === 'number' && !isNaN(d.value));
  
  const hasRiskData = riskData.some(d => d.value > 0);

  // Algorithm data for bar chart
  const algoCounts = {};
  results.forEach(r => {
    const algo = safeCell(r.algorithm_name || r.algorithm || 'Unknown');
    algoCounts[algo] = (algoCounts[algo] || 0) + 1;
  });
  const algoData = Object.entries(algoCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value) // Sort by frequency
    .slice(0, 5) // Top 5 algorithms
    .filter(d => typeof d.value === 'number' && !isNaN(d.value));
  
  const hasAlgoData = algoData.length > 0 && algoData.some(d => d.value > 0);

  // Vulnerability types - redesigned to better categorize
  const vulnTypes = {};
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
    
    vulnTypes[vulnType] = (vulnTypes[vulnType] || 0) + 1;
  });
  
  // Ensure we have at least 3 categories even with demo data
  if (Object.keys(vulnTypes).length < 3) {
    if (!vulnTypes["Shor's Algorithm"]) vulnTypes["Shor's Algorithm"] = 0;
    if (!vulnTypes["Grover's Algorithm"]) vulnTypes["Grover's Algorithm"] = 0;
    if (!vulnTypes["Symmetric Key"]) vulnTypes["Symmetric Key"] = 0;
  }
  
  // Prepare radar data
  const radarData = Object.keys(vulnTypes).map(type => ({
    subject: type,
    A: vulnTypes[type],
    fullMark: Math.max(...Object.values(vulnTypes))
  }));

  // Time projection data (simulated)
  const timelineData = [
    { name: 'Now', risk: 100 },
    { name: '1 year', risk: 110 },
    { name: '2 years', risk: 130 },
    { name: '5 years', risk: 175 },
    { name: '10 years', risk: 240 },
  ];

  // Algorithm distribution by type
  const uniqueAlgorithms = [...new Set(results.map(r => safeCell(r.algorithm_name || r.algorithm)))];

  // Executive summary
  const mostCommonAlgo = algoData.length > 0 ? algoData[0].name : 'N/A';
  const totalVulnerabilities = results.length;
  const highRiskCount = riskData[0]?.value || 0;
  const highRiskPercentage = totalVulnerabilities > 0 ? Math.round((highRiskCount / totalVulnerabilities) * 100) : 0;

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
      ...filtered.map(f => [
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

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-6">
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview' 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('trends')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trends' 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Risk Trends
          </button>
          <button 
            onClick={() => setActiveTab('findings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'findings' 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Detailed Findings
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-4">Risk Level Distribution</h3>
                {hasRiskData ? (
                  <div className="flex justify-center">
                    <PieChart width={250} height={250}>
                      <Pie 
                        data={riskData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {riskData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} findings`]} />
                    </PieChart>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm flex items-center justify-center h-64">
                    No risk data to display.
                  </div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-4">Algorithm Hotspots</h3>
                {hasAlgoData ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={algoData} margin={{ left: 0, right: 20, top: 10, bottom: 60 }}>
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        interval={0} 
                        angle={-45} 
                        textAnchor="end" 
                        height={60} 
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-400 text-sm flex items-center justify-center h-64">
                    No algorithm data to display.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-4">Vulnerability Categories</h3>
                {Object.keys(vulnTypes).length > 0 ? (
                  <div className="space-y-4">
                    {/* Visual category bars */}
                    <div className="space-y-3">
                      {Object.entries(vulnTypes)
                        .sort(([, a], [, b]) => b - a) // Sort by count (descending)
                        .map(([type, count]) => {
                          const total = results.length;
                          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                          const colorInfo = VULN_CATEGORY_COLORS[type] || { bg: '#6366f1', text: '#ffffff' };
                          
                          return (
                            <div key={type} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <span 
                                    className="inline-block w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: colorInfo.bg }}
                                  ></span>
                                  <span className="text-sm font-medium">{type}</span>
                                </div>
                                <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div 
                                  className="h-2.5 rounded-full" 
                                  style={{ 
                                    width: `${percentage}%`, 
                                    backgroundColor: colorInfo.bg 
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                    
                    {/* Distribution chart */}
                    <div className="mt-6">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie 
                            data={Object.entries(vulnTypes).map(([name, value]) => ({ name, value }))}
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={80}
                            innerRadius={40}
                          >
                            {Object.keys(vulnTypes).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={VULN_CATEGORY_COLORS[entry]?.bg || RADAR_COLORS[index % RADAR_COLORS.length]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [
                              `${value} (${Math.round((value / results.length) * 100)}%)`, 
                              name
                            ]} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm flex items-center justify-center h-64">
                    No vulnerability category data to display.
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-4">Key Security Recommendations</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded border-l-4 border-amber-500">
                    <p className="font-medium">Migrate from RSA to Post-Quantum Algorithms</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Replace RSA with NIST-approved post-quantum cryptography standards like ML-KEM.</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                    <p className="font-medium">Increase Symmetric Key Sizes</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ensure all symmetric keys are at least 256 bits to maintain security against Grover's algorithm.</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                    <p className="font-medium">Implement Crypto-Agility</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Design systems to allow easy cryptographic algorithm replacement without major refactoring.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-4">Quantum Risk Projection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This chart projects how the risk from quantum computing will increase over time as quantum computers become more powerful.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Relative Risk (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="risk" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                <p className="text-sm">
                  <span className="font-bold">Q-Day Timeline:</span> Experts predict that within 5-10 years, quantum computers could become powerful enough to break many current cryptographic systems. Start your quantum-safe migration now.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'findings' && (
          <div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filtered.length} of {results.length} findings
              {filtered.length !== results.length && " (filtered)"}
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                    <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Algorithm</th>
                    <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                    <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Line</th>
                    <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f, i) => {
                    const rowKey = uniqueRowKey(f, i);
                    return (
                      <tr key={rowKey} className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-t border-gray-200 dark:border-gray-700">
                        <td className="p-2">{safeCell(f.file_path || f.file)}</td>
                        <td className="p-2">{safeCell(f.algorithm_name || f.algorithm)}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            safeCell(f.risk).toLowerCase() === 'high' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                              : safeCell(f.risk).toLowerCase() === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {safeCell(f.risk)}
                          </span>
                        </td>
                        <td className="p-2">{safeCell(f.vulnerability_type)}</td>
                        <td className="p-2">{safeCell(f.line_number || f.line)}</td>
                        <td className="p-2 max-w-xs truncate" title={safeCell(f.description)}>{safeCell(f.description)}</td>
                        <td className="p-2 max-w-xs truncate" title={safeCell(f.recommendation)}>{safeCell(f.recommendation)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuantumRiskAssessment; 