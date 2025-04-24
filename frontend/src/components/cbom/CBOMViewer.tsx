import React, { useState, useCallback, useMemo } from 'react';
import { 
  CBOMInventory, 
  CryptographicAsset, 
  RiskLevel 
} from '../../types/cbom';
import RiskPieChart from './RiskPieChart';
import VulnTypeBarChart from './VulnTypeBarChart';
import AssetTypeBarChart from './AssetTypeBarChart';
import { 
  exportCBOMAsJSON, 
  exportCBOMAsCSV 
} from '../../utils/cbomConverter';
import { generateQVSReportHtml } from '../../utils/qvsReportFormatUtils';
import { exportQvsToPdf } from '../../utils/qvsBasicExportUtils';

// Unified color system for consistent visualization across all elements
const RISK_COLORS: Record<RiskLevel, { main: string, gradient: string, tailwind: string }> = {
  'Critical': { main: '#ef4444', gradient: '#b91c1c', tailwind: 'bg-red-600 text-white' }, // red-500 to red-700
  'High': { main: '#f97316', gradient: '#c2410c', tailwind: 'bg-orange-500 text-white' }, // orange-500 to orange-700
  'Medium': { main: '#eab308', gradient: '#a16207', tailwind: 'bg-yellow-500 text-gray-900' }, // yellow-500 to yellow-700
  'Low': { main: '#3b82f6', gradient: '#2563eb', tailwind: 'bg-blue-500 text-white' }, // blue-500 to blue-600
  'None': { main: '#10b981', gradient: '#059669', tailwind: 'bg-green-500 text-white' }, // green-500 to green-600
  'Unknown': { main: '#6b7280', gradient: '#4b5563', tailwind: 'bg-gray-500 text-white' } // gray-500 to gray-600
};

// Asset Card Component
const AssetCard: React.FC<{ asset: CryptographicAsset }> = ({ asset }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
      <div className={`px-4 py-2 font-semibold ${RISK_COLORS[asset.risk_level].tailwind}`}>
        {asset.name}
      </div>
      <div className="p-4">
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{asset.type}</p>
        </div>
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Vulnerability</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{asset.vulnerability_type}</p>
        </div>
        {asset.description && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-sm text-gray-800 dark:text-gray-200">{asset.description}</p>
          </div>
        )}
        {asset.file_path && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 truncate">
            {asset.file_path}
            {asset.line_number && `:${asset.line_number}`}
          </div>
        )}
      </div>
    </div>
  );
};

interface CBOMViewerProps {
  cbomData: CBOMInventory | null;
  isLoading?: boolean;
  error?: string | null;
}

const CBOMViewer: React.FC<CBOMViewerProps> = ({ 
  cbomData, 
  isLoading = false, 
  error = null 
}) => {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'summary'>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'All'>('All');
  
  // Handle export functions
  const handleExportJSON = useCallback(() => {
    if (cbomData) {
      exportCBOMAsJSON(cbomData, `cbom_export_${new Date().toISOString().slice(0, 10)}.json`);
    }
  }, [cbomData]);
  
  const handleExportCSV = useCallback(() => {
    if (cbomData) {
      exportCBOMAsCSV(cbomData, `cbom_export_${new Date().toISOString().slice(0, 10)}.csv`);
    }
  }, [cbomData]);
  
  // Filter and sort assets based on search query and risk level
  const filteredComponents = useMemo(() => {
    if (!cbomData) return [];
    
    return cbomData.components.map(component => {
      // Filter assets based on search query and risk level
      const filteredAssets = component.assets.filter(asset => {
        const matchesSearch = 
          searchQuery === '' || 
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.file_path?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRisk = 
          filterRisk === 'All' || 
          asset.risk_level === filterRisk;
        
        return matchesSearch && matchesRisk;
      });
      
      // Sort assets by risk level (highest to lowest)
      const sortedAssets = [...filteredAssets].sort((a, b) => {
        const riskOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3, 'None': 4, 'Unknown': 5 };
        return (riskOrder[a.risk_level] || 99) - (riskOrder[b.risk_level] || 99);
      });
      
      return {
        ...component,
        assets: sortedAssets,
        hasFilteredAssets: filteredAssets.length > 0
      };
    }).filter(component => 
      // Only show components that have matching assets
      component.hasFilteredAssets && 
      // If activeComponent is set, only show that component
      (activeComponent === null || component.name === activeComponent)
    );
  }, [cbomData, searchQuery, filterRisk, activeComponent]);
  
  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!cbomData) return null;
    
    const { risk_summary, vulnerability_summary, total_assets, components } = cbomData;

    // Asset Type Breakdown
    const assetTypeBreakdown: Record<string, number> = {};
    // Vulnerability Type Breakdown
    const vulnTypeBreakdown: Record<string, number> = {};
    components.forEach(component => {
      component.assets.forEach(asset => {
        assetTypeBreakdown[asset.type] = (assetTypeBreakdown[asset.type] || 0) + 1;
        vulnTypeBreakdown[asset.vulnerability_type] = (vulnTypeBreakdown[asset.vulnerability_type] || 0) + 1;
      });
    });

    return {
      totalAssets: total_assets,
      totalComponents: components.length,
      riskBreakdown: risk_summary,
      vulnerabilityBreakdown: vulnerability_summary,
      assetTypeBreakdown,
      vulnTypeBreakdown,
      criticalPercentage: Math.round((risk_summary.critical / total_assets) * 100) || 0,
      highPercentage: Math.round((risk_summary.high / total_assets) * 100) || 0
    };
  }, [cbomData]);

  // Example scan metadata (replace with real data as needed)
  const scanMeta = {
    date: new Date().toLocaleDateString(),
    scanId: cbomData?.id || 'N/A',
  };

  // Optionally, allow user to customize recipient/audience in the future
  const recipient = undefined;

  // QVS PDF Export Button
const handleQvsExportPdf = useCallback(() => {
  if (!cbomData) return;
  // Basic HTML summary (replace with your real summary logic)
  const summaryHtml = `
    <div class="summary-card">
      <h2>CBOM Summary</h2>
      <ul>
        <li><strong>Total Components:</strong> ${summaryStats?.totalComponents ?? 'N/A'}</li>
        <li><strong>Total Assets:</strong> ${summaryStats?.totalAssets ?? 'N/A'}</li>
        <li><strong>Critical Findings:</strong> ${summaryStats?.criticalPercentage ?? 0}%</li>
        <li><strong>High Findings:</strong> ${summaryStats?.highPercentage ?? 0}%</li>
      </ul>
    </div>
  `;
  const html = generateQVSReportHtml(summaryHtml, {
    title: 'QVS CBOM Summary Report',

    assessmentDate: cbomData.generated_at,
    username: 'QVS Security',
    darkMode: false
  });
  exportQvsToPdf(html, { title: 'QVS_CBOM_Summary_Report' });
}, [cbomData, summaryStats]);

const pdfExportButton = (
  <button
    onClick={handleQvsExportPdf}
    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md text-sm"
  >
    Export PDF Summary
  </button>
);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" aria-label="Loading"></div>
        <span className="sr-only">Loading</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  if (!cbomData) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
        <p>No CBOM data available. Run a scan to generate a Cryptographic Bill of Materials.</p>
      </div>
    );
  }
  
  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 dark">
      {/* Force dark mode for the entire component */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Cryptographic Bill of Materials
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Generated: {new Date(cbomData.generated_at).toLocaleString()}
          </p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0 items-center">
  <button
    onClick={handleExportJSON}
    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-sm"
  >
    Export JSON
  </button>
  <button
    onClick={handleExportCSV}
    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md text-sm"
  >
    Export CSV
  </button>
  {pdfExportButton}
</div>
      </div>
      
      {/* Filters and View Mode Selectors */}
      <div className="bg-gray-800 shadow-sm rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label htmlFor="searchQuery" className="block text-xs font-medium text-gray-300 mb-1">
              Search
            </label>
            <input
              id="searchQuery"
              type="text"
              placeholder="Search assets by name, description, or file path..."
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Risk Level Filter */}
          <div>
            <label htmlFor="riskFilter" className="block text-xs font-medium text-gray-300 mb-1">
              Risk Level
            </label>
            <select
              id="riskFilter"
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'All')}
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="None">None</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          
          {/* Component Filter */}
          <div>
            <label htmlFor="componentFilter" className="block text-xs font-medium text-gray-300 mb-1">
              Component
            </label>
            <select
              id="componentFilter"
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              value={activeComponent || ''}
              onChange={(e) => setActiveComponent(e.target.value || null)}
            >
              <option value="">All Components</option>
              {cbomData.components.map(comp => (
                <option key={comp.id || comp.name} value={comp.name}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* View Mode Selector */}
          <div className="flex flex-col justify-end">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              View Mode
            </label>
            <div className="flex space-x-1 bg-gray-700 p-1 rounded-md">
              <button
                className={`flex-1 px-3 py-1 rounded-md text-sm ${viewMode === 'summary' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setViewMode('summary')}
              >
                Summary
              </button>
              <button
                className={`flex-1 px-3 py-1 rounded-md text-sm ${viewMode === 'cards' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setViewMode('cards')}
              >
                Cards
              </button>
              <button
                className={`flex-1 px-3 py-1 rounded-md text-sm ${viewMode === 'table' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setViewMode('table')}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary View */}
      {viewMode === 'summary' && summaryStats && (
        <div className="flex flex-col gap-6">
          {/* Summary Stats Section */}
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-white">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-900/30 p-4 rounded-lg">
                <p className="text-sm text-blue-300">Total Assets</p>
                <p className="text-2xl font-bold text-blue-100">{summaryStats.totalAssets}</p>
              </div>
              <div className="bg-purple-900/30 p-4 rounded-lg">
                <p className="text-sm text-purple-300">Total Components</p>
                <p className="text-2xl font-bold text-purple-100">{summaryStats.totalComponents}</p>
              </div>
              <div className="bg-red-900/30 p-4 rounded-lg">
                <p className="text-sm text-red-300">Critical Risk Assets</p>
                <p className="text-2xl font-bold text-red-100">
                  {summaryStats.riskBreakdown.critical}
                  <span className="text-sm ml-1">({summaryStats.criticalPercentage}%)</span>
                </p>
              </div>
              <div className="bg-orange-900/30 p-4 rounded-lg">
                <p className="text-sm text-orange-300">High Risk Assets</p>
                <p className="text-2xl font-bold text-orange-100">
                  {summaryStats.riskBreakdown.high}
                  <span className="text-sm ml-1">({summaryStats.highPercentage}%)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Risk Distribution Section */}
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-md font-semibold mb-3 text-gray-300">Risk Distribution</h3>
            {/* Risk distribution visualization */}
            {(() => {
              return (
                <>
                  {/* Risk Distribution Bar */}
                  <div className="h-8 w-full flex rounded-md overflow-hidden mb-1 relative">
                    {Object.entries(summaryStats.riskBreakdown).map(([risk, count]) => {
                      if (count === 0) return null;
                      const percentage = (count / summaryStats.totalAssets) * 100;
                      // Use our unified color system for consistent visualization
                      const formattedRisk = risk.charAt(0).toUpperCase() + risk.slice(1) as RiskLevel;
                      const color = RISK_COLORS[formattedRisk]?.main || RISK_COLORS['Unknown'].main;
                      
                      return (
                        <div
                          key={risk}
                          className="h-full flex items-center justify-center relative group"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: color,
                            minWidth: percentage < 5 ? '24px' : 'auto' // Ensure small segments are still visible
                          }}
                        >
                          {percentage >= 8 && (
                            <span className="text-xs font-medium text-white drop-shadow-sm">
                              {formattedRisk}
                            </span>
                          )}
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-1 z-10">
                            {formattedRisk}: {count} ({Math.round(percentage)}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend below the bar with explanations */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-2 gap-y-1 mt-2 text-xs">
                    <div className="flex items-start">
                      <span className="inline-block w-3 h-3 mt-0.5 mr-1 rounded-sm flex-shrink-0" style={{ backgroundColor: RISK_COLORS['Critical'].main }}></span>
                      <div>
                        <span className="font-medium text-gray-300">Critical:</span>
                        <span className="text-gray-400 ml-1">{summaryStats.riskBreakdown.critical}</span>
                        <p className="text-gray-500 mt-0.5 text-xs leading-tight">Severe quantum vulnerability requiring immediate action</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="inline-block w-3 h-3 mt-0.5 mr-1 rounded-sm flex-shrink-0" style={{ backgroundColor: RISK_COLORS['High'].main }}></span>
                      <div>
                        <span className="font-medium text-gray-300">High:</span>
                        <span className="text-gray-400 ml-1">{summaryStats.riskBreakdown.high}</span>
                        <p className="text-gray-500 mt-0.5 text-xs leading-tight">Significant security risk needing prompt attention</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="inline-block w-3 h-3 mt-0.5 mr-1 rounded-sm flex-shrink-0" style={{ backgroundColor: RISK_COLORS['Medium'].main }}></span>
                      <div>
                        <span className="font-medium text-gray-300">Medium:</span>
                        <span className="text-gray-400 ml-1">{summaryStats.riskBreakdown.medium}</span>
                        <p className="text-gray-500 mt-0.5 text-xs leading-tight">Moderate risk requiring planned mitigation</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="inline-block w-3 h-3 mt-0.5 mr-1 rounded-sm flex-shrink-0" style={{ backgroundColor: RISK_COLORS['Low'].main }}></span>
                      <div>
                        <span className="font-medium text-gray-300">Low:</span>
                        <span className="text-gray-400 ml-1">{summaryStats.riskBreakdown.low}</span>
                        <p className="text-gray-500 mt-0.5 text-xs leading-tight">Minor security concerns with lower priority</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="inline-block w-3 h-3 mt-0.5 mr-1 rounded-sm flex-shrink-0" style={{ backgroundColor: RISK_COLORS['None'].main }}></span>
                      <div>
                        <span className="font-medium text-gray-300">None:</span>
                        <span className="text-gray-400 ml-1">{summaryStats.riskBreakdown.none}</span>
                        <p className="text-gray-500 mt-0.5 text-xs leading-tight">Quantum-safe implementations with no known vulnerabilities</p>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* CBOM Visualizations Section Header */}
          <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h3 className="text-md font-semibold text-gray-300">CBOM Visualizations</h3>
            <p className="text-xs text-gray-400 mt-2">
              Visual breakdowns of risk levels, vulnerability types, and asset types in your cryptographic bill of materials.
              Each chart provides unique insights into different aspects of your CBOM inventory.
            </p>
          </div>

          {/* Risk Distribution Chart */}
          <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
            <div className="flex-1 min-w-[300px]">
              <RiskPieChart cbomData={cbomData} />
            </div>
          </div>
          
          {/* Vulnerability Type Chart */}
          <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
            <div className="flex-1 min-w-[300px]">
              <VulnTypeBarChart cbomData={cbomData} />
            </div>
          </div>
          
          {/* Asset Type Chart */}
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <div className="flex-1 min-w-[300px]">
              <AssetTypeBarChart cbomData={cbomData} />
            </div>
          </div>
        </div>
      )}
      
      {/* Card View */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {filteredComponents.map((component: any) => (
            <div key={component.id || component.name} className="bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
                <h2 className="text-lg font-semibold text-white">
                  {component.name}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({component.assets.length} assets)
                  </span>
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 text-gray-100">
                  {component.assets.map((asset: CryptographicAsset) => (
                    <AssetCard key={asset.id || asset.name} asset={asset} />
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filteredComponents.length === 0 && (
            <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-200 px-4 py-3 rounded-md">
              No components or assets match your filter criteria.
            </div>
          )}
        </div>
      )}
      
      {/* Table View */}
      {viewMode === 'table' && (
        <div className="space-y-6">
          {filteredComponents.map((component: any) => (
            <div key={component.id || component.name} className="bg-gray-800 shadow-sm rounded-lg overflow-x-auto">
              <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
                <h2 className="text-lg font-semibold text-white">
                  {component.name}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({component.assets.length} assets)
                  </span>
                </h2>
              </div>
              
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Asset
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Risk
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Vulnerability
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {component.assets.map((asset: CryptographicAsset) => (
                    <tr key={asset.id || asset.name} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {asset.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {asset.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span 
                          className="px-2 py-1 text-xs font-medium rounded-full" 
                          style={{ 
                            backgroundColor: RISK_COLORS[asset.risk_level]?.main || RISK_COLORS['Unknown'].main,
                            color: 'white' 
                          }}
                        >
                          {asset.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {asset.vulnerability_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {asset.file_path}
                        {asset.line_number && `:${asset.line_number}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          
          {filteredComponents.length === 0 && (
            <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-200 px-4 py-3 rounded-md">
              No components or assets match your filter criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CBOMViewer;