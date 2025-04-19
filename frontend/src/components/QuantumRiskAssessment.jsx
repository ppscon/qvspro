// Checklist for React runtime errors:
// - Ensure only one version of React and react-dom is installed (npm ls react)
// - If errors persist, delete node_modules and package-lock.json, then run npm install
// - All table rows and mapped children must have a unique key prop
// - Never render React elements or arrays directly as table cell values

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

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

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

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

function QuantumRiskAssessment({ results }) {
  const [search, setSearch] = useState('');

  // Filtered findings
  const filtered = useMemo(() =>
    results.filter(f =>
      safeCell(f.algorithm).toLowerCase().includes(search.toLowerCase()) ||
      safeCell(f.risk).toLowerCase().includes(search.toLowerCase()) ||
      safeCell(f.file_path || f.file).toLowerCase().includes(search.toLowerCase()) ||
      safeCell(f.vulnerability_type).toLowerCase().includes(search.toLowerCase())
    ), [results, search]
  );

  // Risk level data for pie chart
  const riskData = [
    { name: 'High', value: results.filter(r => safeCell(r.risk).toLowerCase() === 'high').length },
    { name: 'Medium', value: results.filter(r => safeCell(r.risk).toLowerCase() === 'medium').length },
    { name: 'Low', value: results.filter(r => safeCell(r.risk).toLowerCase() === 'low').length },
  ].filter(d => typeof d.value === 'number' && !isNaN(d.value));
  // Debug log for riskData
  // eslint-disable-next-line no-console
  console.log('riskData for PieChart:', riskData);
  const hasRiskData = riskData.some(d => d.value > 0);

  // Algorithm data for bar chart
  const algoCounts = {};
  results.forEach(r => {
    const algo = safeCell(r.algorithm_name || r.algorithm || 'Unknown');
    algoCounts[algo] = (algoCounts[algo] || 0) + 1;
  });
  const algoData = Object.entries(algoCounts)
    .map(([name, value]) => ({ name, value }))
    .filter(d => typeof d.value === 'number' && !isNaN(d.value));
  // Debug log for algoData
  // eslint-disable-next-line no-console
  console.log('algoData for BarChart:', algoData);
  const hasAlgoData = algoData.length > 0 && algoData.some(d => d.value > 0);

  // Executive summary
  const mostCommonAlgo = algoData.length > 0 ? algoData[0].name : 'N/A';

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-6">
      <h2 className="text-2xl font-bold mb-2">Quantum Risk Assessment</h2>
      {/* Executive summary */}
      <div className="mb-4">
        <p>
          <strong>{riskData[0].value}</strong> high-risk, <strong>{riskData[1].value}</strong> medium-risk, and <strong>{riskData[2].value}</strong> low-risk findings detected.<br />
          Most common algorithm: <strong>{mostCommonAlgo}</strong>.
        </p>
      </div>
      {/* Charts */}
      <div className="flex flex-wrap gap-8">
        <div>
          <h3 className="font-semibold mb-2">Risk Level Distribution</h3>
          {hasRiskData ? (
            <PieChart width={200} height={200}>
              <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {riskData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} findings`]} />
            </PieChart>
          ) : (
            <div className="text-gray-400 text-sm">No risk data to display.</div>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Algorithm Hotspots</h3>
          {hasAlgoData ? (
            <ResponsiveContainer width={300} height={200}>
              <BarChart data={algoData} margin={{ left: 10, right: 10 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Bar dataKey="value" fill="#6366f1" />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-400 text-sm">No algorithm data to display.</div>
          )}
        </div>
      </div>
      {/* Search and Table */}
      <div className="mt-6">
        <div className="flex items-center mb-2">
          <SearchIcon size={18} className="mr-2" />
          <input
            type="text"
            placeholder="Search findings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="p-2 rounded border border-gray-300 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
            <thead>
              <tr>
                <th className="p-2">File</th>
                <th className="p-2">Algorithm</th>
                <th className="p-2">Risk</th>
                <th className="p-2">Type</th>
                <th className="p-2">Line</th>
                <th className="p-2">Description</th>
                <th className="p-2">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => {
                const rowKey = uniqueRowKey(f, i);
                return (
                  <tr key={rowKey} className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <td className="p-2">{safeCell(f.file_path || f.file)}</td>
                    <td className="p-2">{safeCell(f.algorithm_name || f.algorithm)}</td>
                    <td className="p-2">{safeCell(f.risk)}</td>
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
      {/* Recommendations and Export buttons can be added here */}
    </div>
  );
}

export default QuantumRiskAssessment; 