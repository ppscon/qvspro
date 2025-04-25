import React from 'react';
import { CBOMInventory, RiskLevel } from '../../types/cbom';

// Extended interfaces for our component
interface ExtendedCryptographicAsset {
  id: string;
  name: string;
  type: string;
  risk_level: RiskLevel | 'Unknown';
  algorithm?: string;
  vulnerability_type?: string;
  file_path?: string;
  line_number?: number;
  description?: string;
  recommendation?: string;
}

interface ExtendedCBOMInventory extends Omit<CBOMInventory, 'components'> {
  components: Array<{
    name: string;
    assets: ExtendedCryptographicAsset[];
  }>;
  scan_metadata?: {
    files_scanned: number;
    lines_of_code: number;
    language_breakdown: Array<{
      language: string;
      percentage: number;
      fileCount: number;
    }>;
  };
}

// Group function for organizing assets
const groupBy = <T extends Record<string, any>, K extends keyof any>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((result, item) => {
    const key = getKey(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
};

// Risk color mapping for UI elements
const RISK_COLORS = {
  Critical: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    description: 'Immediate action required. Vulnerable to quantum attacks.'
  },
  High: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300',
    description: 'Prioritize remediation. Significant quantum risk.'
  },
  Medium: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300',
    description: 'Plan for migration. Moderate quantum risk.'
  },
  Low: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
    description: 'Monitor developments. Limited quantum risk.'
  },
  None: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    description: 'Quantum resistant. No action needed.'
  },
  Unknown: {
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    text: 'text-gray-800 dark:text-gray-300',
    description: 'Risk level unknown.'
  }
};

// Risk badge component
const RiskBadge: React.FC<{ level: RiskLevel | 'Unknown' }> = ({ level }) => {
  return (
    <span className={`${RISK_COLORS[level].bg} ${RISK_COLORS[level].text} px-2 py-1 rounded text-xs font-medium inline-block`}>
      {level}
    </span>
  );
};

/**
 * CBOMReport Component
 * Provides a comprehensive view of the Cryptography Bill of Materials (CBOM)
 * including quantum vulnerability assessments, algorithm analysis, and remediation guidance
 */
const CBOMReport: React.FC<{
  cbomData: ExtendedCBOMInventory;
  organizationName?: string;
  scanDate?: Date;
  darkMode?: boolean;
  showRecommendations?: boolean;
}> = ({ 
  cbomData, 
  organizationName = 'Organization', 
  scanDate = new Date(), 
  darkMode = false,
  showRecommendations = true
}) => {
  // Extract all assets from components
  const allAssets = cbomData.components.flatMap(component => component.assets);
  const totalAssets = allAssets.length;
  
  // Group assets by component
  const componentAssets = cbomData.components.map(component => ({
    name: component.name,
    assets: component.assets,
    assetsByType: groupBy(component.assets, asset => asset.type)
  }));
  
  // Extract risk counts
  const riskCounts = {
    Critical: allAssets.filter(a => a.risk_level === 'Critical').length,
    High: allAssets.filter(a => a.risk_level === 'High').length,
    Medium: allAssets.filter(a => a.risk_level === 'Medium').length,
    Low: allAssets.filter(a => a.risk_level === 'Low').length,
    None: allAssets.filter(a => a.risk_level === 'None').length,
    Unknown: allAssets.filter(a => a.risk_level === 'Unknown').length
  };
  
  // Calculate metrics for risk assessment
  const atRiskCount = riskCounts.Critical + riskCounts.High;
  const atRiskPercentage = totalAssets > 0 ? (atRiskCount / totalAssets) * 100 : 0;
  
  // Calculate overall risk
  let overallRisk: RiskLevel = 'Low';
  if (atRiskPercentage >= 25) overallRisk = 'Critical';
  else if (atRiskPercentage >= 15) overallRisk = 'High';
  else if (atRiskPercentage >= 5) overallRisk = 'Medium';
  
  // Formatted date
  const dateOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedScanDate = scanDate.toLocaleDateString(undefined, dateOptions);
  
  // Calculate vulnerability statistics
  const vulnerabilityStats = {
    critical: riskCounts.Critical,
    high: riskCounts.High,
    medium: riskCounts.Medium,
    low: riskCounts.Low,
    total: totalAssets
  };
  
  // Create metrics object
  const vulnerabilityMetrics = {
    overallRiskScore: atRiskPercentage,
    quantumReadiness: Math.max(0, 1 - (atRiskPercentage / 100))
  };
  
  // Calculate quantum-readiness percentage
  const quantumReadinessPercentage = Math.round(vulnerabilityMetrics.quantumReadiness * 100);
  const quantumGap = 100 - quantumReadinessPercentage;
  
  // Risk order map for sorting
  const riskOrder: Record<string, number> = {
    'Critical': 0,
    'High': 1,
    'Medium': 2,
    'Low': 3,
    'None': 4,
    'Unknown': 5
  };
  
  // Generate algorithm data from assets
  const algorithmData = Object.entries(
    groupBy(allAssets, a => a.algorithm || 'Unknown')
  ).map(([algorithm, assets]) => ({
    name: algorithm,
    count: assets.length,
    riskLevel: assets.sort((a, b) => {
      return riskOrder[a.risk_level] - riskOrder[b.risk_level];
    })[0]?.risk_level || 'Unknown'
  }));

  // Generate codebase statistics
  const codebaseStats = {
    filesScanned: cbomData.scan_metadata?.files_scanned || 0,
    linesOfCode: cbomData.scan_metadata?.lines_of_code || 0,
    librariesAnalyzed: cbomData.components.length,
    cryptoInstances: allAssets.length,
    languageBreakdown: cbomData.scan_metadata?.language_breakdown || []
  };

  return (
    <div className={`max-w-7xl mx-auto p-8 print:p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} print:bg-white print:text-gray-800`}>
      <div className={`flex justify-between items-center flex-wrap mb-8 pb-4 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'} print:border-blue-500`}>
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'} print:text-blue-600`}>
            Cryptography Bill of Materials (CBOM)
          </h1>
          <p className="text-base">
            <strong>Organization:</strong> {organizationName}
          </p>
          <p className="text-base">
            <strong>Scan Date:</strong> {formattedScanDate}
          </p>
        </div>
        <div className="hidden md:block print:block">
          <img 
            src="/images/logo-qvs.png" 
            alt="QVS-Pro" 
            className="h-36 object-contain" 
          />
        </div>
      </div>

      {/* Quantum Risk Overview Section */}
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} shadow rounded-lg p-6 mb-8 print:bg-white print:text-black`}>
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-400 border-gray-600' : 'text-blue-600 border-gray-200'} border-b pb-2 mb-4 print:text-blue-600 print:border-gray-200`}>
          Quantum Vulnerability Assessment
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          <div className="col-span-12 md:col-span-4">
            <div className="flex flex-col items-center justify-center h-full">
              {/* Risk Score Display */}
              <div className="relative">
                <svg className="w-40 h-40" viewBox="0 0 120 120">
                  <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                  />
                  <circle
                    className={
                      vulnerabilityMetrics.overallRiskScore >= 75 ? "text-red-500" :
                      vulnerabilityMetrics.overallRiskScore >= 50 ? "text-orange-500" :
                      vulnerabilityMetrics.overallRiskScore >= 25 ? "text-amber-500" : "text-green-500"
                    }
                    strokeWidth="12"
                    strokeDasharray={`${Math.min(100, vulnerabilityMetrics.overallRiskScore) * 3.14}, 314`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                  />
                  <text
                    x="60"
                    y="60"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    className="text-3xl font-bold print:fill-black"
                    fill={darkMode ? "white" : "black"}
                  >
                    {Math.round(vulnerabilityMetrics.overallRiskScore)}
                  </text>
                </svg>
              </div>
              <p className={`mt-4 text-lg font-semibold ${
                overallRisk === 'Critical' ? 'text-red-600' :
                overallRisk === 'High' ? 'text-orange-500' :
                overallRisk === 'Medium' ? 'text-amber-500' : 'text-green-600'
              }`}>
                {overallRisk} Quantum Risk
              </p>
            </div>
          </div>
          
          <div className="col-span-12 md:col-span-8">
            <div>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : ''}`}>Vulnerability Statistics</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Total Vulnerabilities Card */}
                <div className={`${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg shadow-sm p-4`}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg">Total Vulnerabilities Detected:</h4>
                    <p className="text-2xl font-bold">{vulnerabilityStats.total.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`${darkMode ? 'bg-red-900' : 'bg-red-50'} rounded-lg p-3`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Critical</p>
                    <p className="text-lg font-semibold text-red-600">{vulnerabilityStats.critical}</p>
                  </div>
                  <div className={`${darkMode ? 'bg-orange-900' : 'bg-orange-50'} rounded-lg p-3`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>High</p>
                    <p className="text-lg font-semibold text-orange-500">{vulnerabilityStats.high}</p>
                  </div>
                  <div className={`${darkMode ? 'bg-amber-900' : 'bg-amber-50'} rounded-lg p-3`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Medium</p>
                    <p className="text-lg font-semibold text-amber-500">{vulnerabilityStats.medium}</p>
                  </div>
                  <div className={`${darkMode ? 'bg-green-900' : 'bg-green-50'} rounded-lg p-3`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Low</p>
                    <p className="text-lg font-semibold text-green-600">{vulnerabilityStats.low}</p>
                  </div>
                </div>
              </div>
              
              {/* Quantum Readiness Section */}
              <div className="mt-4">
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : ''}`}>Quantum Readiness</h3>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-3`}>
                  <div className="flex justify-between mb-1">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>Ready:</p>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : ''}`}>
                      {quantumReadinessPercentage}%
                    </p>
                  </div>
                  {quantumGap > 0 && (
                    <div className="flex justify-between">
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>Gap:</p>
                      <p className={`text-sm font-semibold ${
                        quantumGap > 50 ? 'text-red-600' : 
                        quantumGap > 20 ? 'text-orange-500' : 'text-green-600'
                      }`}>
                        {quantumGap}%
                      </p>
                    </div>
                  )}
                  <div className="mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className={`h-2.5 rounded-full ${
                        quantumReadinessPercentage < 30 ? 'bg-red-600' :
                        quantumReadinessPercentage < 70 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${quantumReadinessPercentage}%` }}>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerability Breakdown and Algorithm Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} shadow rounded-lg p-6 h-full`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-400 border-gray-600' : 'text-blue-600 border-gray-200'} border-b pb-2 mb-4`}>
            Vulnerability Severity Breakdown
          </h2>
          <div className="flex flex-col items-center">
            {/* SVG Donut Chart for Vulnerability Severity */}
            <svg width="280" height="280" viewBox="0 0 280 280">
              <g transform="translate(140, 140)">
                {/* Calculate the slices for the donut chart */}
                {(() => {
                  const total = vulnerabilityStats.total || 1; // Avoid division by zero
                  const data = [
                    { name: 'Critical', value: vulnerabilityStats.critical, color: '#dc2626', startAngle: 0 },
                    { name: 'High', value: vulnerabilityStats.high, color: '#ea580c', startAngle: 0 },
                    { name: 'Medium', value: vulnerabilityStats.medium, color: '#d97706', startAngle: 0 },
                    { name: 'Low', value: vulnerabilityStats.low, color: '#2563eb', startAngle: 0 }
                  ];
                  
                  // Calculate the start angle for each slice
                  let currentAngle = 0;
                  data.forEach(item => {
                    item.startAngle = currentAngle;
                    currentAngle += (item.value / total) * Math.PI * 2;
                  });
                  
                  // Draw the arcs
                  return data.map((item, index) => {
                    const endAngle = item.startAngle + (item.value / total) * Math.PI * 2;
                    if (item.value === 0) return null;
                    
                    // Calculate path for an arc
                    const x1 = Math.sin(item.startAngle) * 100;
                    const y1 = -Math.cos(item.startAngle) * 100;
                    const x2 = Math.sin(endAngle) * 100;
                    const y2 = -Math.cos(endAngle) * 100;
                    
                    // Determine if the arc should be drawn as a large arc
                    const largeArcFlag = (endAngle - item.startAngle) > Math.PI ? 1 : 0;
                    
                    const pathData = [
                      `M ${x1} ${y1}`, // Move to start point
                      `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Draw outer arc
                      `L 0 0`, // Line to center
                      `Z` // Close path
                    ].join(' ');
                    
                    return (
                      <path 
                        key={index} 
                        d={pathData} 
                        fill={item.color} 
                        stroke={darkMode ? "#1f2937" : "#ffffff"} 
                        strokeWidth="2"
                      />
                    );
                  });
                })()}
                {/* Center circle for donut hole */}
                <circle r="60" fill={darkMode ? "#374151" : "#ffffff"} />
              </g>
            </svg>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-600 mr-2"></div>
                <span>Critical: {vulnerabilityStats.critical}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-600 mr-2"></div>
                <span>High: {vulnerabilityStats.high}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-amber-600 mr-2"></div>
                <span>Medium: {vulnerabilityStats.medium}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-600 mr-2"></div>
                <span>Low: {vulnerabilityStats.low}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} shadow rounded-lg p-6 h-full`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-400 border-gray-600' : 'text-blue-600 border-gray-200'} border-b pb-2 mb-4`}>
            Algorithm Type Distribution
          </h2>
          <div className="h-64">
            {/* SVG Bar Chart for Algorithm Distribution */}
            <svg width="100%" height="100%" viewBox="0 0 400 240">
              {/* Y-axis */}
              <line x1="40" y1="20" x2="40" y2="220" stroke={darkMode ? "#6b7280" : "#9ca3af"} strokeWidth="1" />
              
              {/* X-axis */}
              <line x1="40" y1="220" x2="380" y2="220" stroke={darkMode ? "#6b7280" : "#9ca3af"} strokeWidth="1" />
              
              {/* Bars */}
              {algorithmData.slice(0, 5).map((item, index) => {
                const barWidth = 50;
                const barHeight = Math.min(180, (item.count / Math.max(...algorithmData.map(d => d.count))) * 180);
                const x = 60 + index * 70;
                const y = 220 - barHeight;
                
                // Determine color based on risk level
                const barColor = 
                  item.riskLevel === 'Critical' ? '#dc2626' :
                  item.riskLevel === 'High' ? '#ea580c' :
                  item.riskLevel === 'Medium' ? '#d97706' :
                  item.riskLevel === 'Low' ? '#2563eb' :
                  item.riskLevel === 'None' ? '#16a34a' : '#6b7280';
                
                return (
                  <g key={index}>
                    <rect 
                      x={x} 
                      y={y} 
                      width={barWidth} 
                      height={barHeight} 
                      fill={barColor} 
                      opacity="0.8"
                    />
                    <text 
                      x={x + barWidth/2} 
                      y={y - 10} 
                      textAnchor="middle" 
                      fontSize="12" 
                      fill={darkMode ? "#e5e7eb" : "#111827"}
                    >
                      {item.count}
                    </text>
                    <text 
                      x={x + barWidth/2} 
                      y={230} 
                      textAnchor="middle" 
                      fontSize="10" 
                      fill={darkMode ? "#e5e7eb" : "#111827"}
                      transform={`rotate(45, ${x + barWidth/2}, 230)`}
                    >
                      {item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Top Vulnerable Components Section */}
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} shadow rounded-lg p-6 mt-8`}>
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-400 border-gray-600' : 'text-blue-600 border-gray-200'} border-b pb-2 mb-4`}>
          Top Vulnerable Components
        </h2>
        {/* Simple table implementation */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Component</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Risk Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Vulnerabilities</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Top Algorithm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {componentAssets
                .sort((a, b) => {
                  const aCriticalCount = a.assets.filter(asset => asset.risk_level === 'Critical').length;
                  const bCriticalCount = b.assets.filter(asset => asset.risk_level === 'Critical').length;
                  return bCriticalCount - aCriticalCount;
                })
                .slice(0, 5)
                .map(component => {
                  const highestRiskAsset = component.assets.sort((a, b) => {
                    return riskOrder[a.risk_level] - riskOrder[b.risk_level];
                  })[0];
                  const highestRisk = highestRiskAsset?.risk_level || 'Unknown';
                  
                  // Calculate most common algorithm
                  const algorithmCounts = component.assets.reduce((acc, asset) => {
                    const algo = asset.algorithm || 'Unknown';
                    acc[algo] = (acc[algo] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  const topAlgorithm = Object.entries(algorithmCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([algo]) => algo)[0] || 'Unknown';
                  
                  return (
                    <tr key={component.name}>
                      <td className="px-4 py-4 whitespace-nowrap">{component.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <RiskBadge level={highestRisk} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{component.assets.length}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{topAlgorithm}</td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Codebase Analysis Section */}
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} shadow rounded-lg p-6 mt-8`}>
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-400 border-gray-600' : 'text-blue-600 border-gray-200'} border-b pb-2 mb-4`}>
          Codebase Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-5">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h3 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-200' : ''}`}>Scan Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Files Scanned:</span>
                  <span className="font-medium">{codebaseStats.filesScanned}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lines of Code:</span>
                  <span className="font-medium">{codebaseStats.linesOfCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Libraries Analyzed:</span>
                  <span className="font-medium">{codebaseStats.librariesAnalyzed}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Crypto Instances:</span>
                  <span className="font-medium">{codebaseStats.cryptoInstances}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-7">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg h-full">
              <h3 className={`text-md font-semibold mb-3 ${darkMode ? 'text-gray-200' : ''}`}>Language Distribution</h3>
              {/* Horizontal bar chart for language distribution */}
              <div className="space-y-4">
                {codebaseStats.languageBreakdown.slice(0, 5).map((lang, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{lang.language}</span>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{lang.percentage}% ({lang.fileCount} files)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{ 
                          width: `${lang.percentage}%`,
                          backgroundColor: [
                            '#3b82f6', '#ef4444', '#f97316', '#f59e0b', '#10b981'
                          ][index % 5]
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                {codebaseStats.languageBreakdown.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-6">No language data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NIST Recommendations Section */}
      {showRecommendations && (
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} shadow rounded-lg p-6 mt-8`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-400 border-gray-600' : 'text-blue-600 border-gray-200'} border-b pb-2 mb-4`}>
            NIST PQC Recommendations
          </h2>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-blue-50'} p-4 rounded-lg`}>
            <h3 className={`text-md font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              Quantum-Safe Migration Path
            </h3>
            <div className="space-y-4">
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className="font-medium mb-1">RSA/DSA/ECC Signature Schemes ➔ NIST Standards</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Replace with CRYSTALS-Dilithium, FALCON, or SPHINCS+
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className="font-medium mb-1">RSA/ECC Key Exchange ➔ NIST Standards</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Replace with CRYSTALS-Kyber
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className="font-medium mb-1">AES-128 ➔ Increased Key Size</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Upgrade to AES-256 for stronger quantum resistance
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`mt-12 pt-4 border-t ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} text-center text-sm`}>
        <p>© {new Date().getFullYear()} QVS-Pro - Cryptography Bill of Materials Report</p>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            /* Force white background and dark text */
            body, div, section, article {
              background-color: white !important;
              color: #1f2937 !important;
            }
            
            /* Ensure headings are visible */
            h1, h2, h3, h4, h5, h6 {
              color: #1e40af !important;
            }
            
            /* Make sure SVG elements use proper print colors */
            svg text {
              fill: #111827 !important;
            }
            
            /* Ensure chart elements are visible */
            .bg-gray-700, .bg-gray-800, .bg-gray-900, .dark\\:bg-gray-700, .dark\\:bg-gray-800, .dark\\:bg-gray-900 {
              background-color: white !important;
            }
            
            /* Force dark text on light backgrounds for all text elements */
            .text-white, .text-gray-200, .text-gray-300, .text-gray-400, 
            .dark\\:text-white, .dark\\:text-gray-200, .dark\\:text-gray-300, .dark\\:text-gray-400 {
              color: #111827 !important;
            }
            
            /* Make sure borders are visible */
            .border-gray-600, .border-gray-700, .border-gray-800,
            .dark\\:border-gray-600, .dark\\:border-gray-700, .dark\\:border-gray-800 {
              border-color: #d1d5db !important;
            }
            
            /* Ensure SVG stroke colors are visible */
            svg line, svg path {
              stroke: #6b7280 !important;
            }
            
            /* Make sure the donut chart is visible in print */
            svg path {
              stroke: #ffffff !important;
              stroke-width: 1 !important;
            }
            
            /* Ensure the bars in the bar chart are visible */
            svg rect {
              opacity: 0.9 !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default CBOMReport;
