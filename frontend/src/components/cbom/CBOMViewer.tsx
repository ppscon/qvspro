import React, { useState, useCallback, useMemo } from 'react';
import { 
  CBOMInventory, 
  CryptographicAsset, 
  RiskLevel 
} from '../../types/cbom';
import { 
  exportCBOMAsJSON, 
  exportCBOMAsCSV 
} from '../../utils/cbomConverter';

// Risk level colors for visualization
const RISK_COLORS: Record<RiskLevel, string> = {
  'Critical': 'bg-red-600 text-white',
  'High': 'bg-orange-500 text-white',
  'Medium': 'bg-yellow-500 text-gray-900',
  'Low': 'bg-blue-500 text-white',
  'None': 'bg-green-500 text-white',
  'Unknown': 'bg-gray-500 text-white'
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
    
    const { risk_summary, vulnerability_summary, total_assets } = cbomData;
    
    return {
      totalAssets: total_assets,
      totalComponents: cbomData.components.length,
      riskBreakdown: risk_summary,
      vulnerabilityBreakdown: vulnerability_summary,
      criticalPercentage: Math.round((risk_summary.critical / total_assets) * 100) || 0,
      highPercentage: Math.round((risk_summary.high / total_assets) * 100) || 0
    };
  }, [cbomData]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
    <div className="container mx-auto px-4 py-6 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Cryptographic Bill of Materials
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Generated: {new Date(cbomData.generated_at).toLocaleString()}
          </p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
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
        </div>
      </div>
      
      {/* Filters and View Mode Selectors */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search assets by name, description, or file path..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       dark:bg-gray-700 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Risk Level Filter */}
          <div className="md:w-48">
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                       dark:bg-gray-700 dark:text-white"
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
          <div className="md:w-48">
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                       dark:bg-gray-700 dark:text-white"
              value={activeComponent || ''}
              onChange={(e) => setActiveComponent(e.target.value || null)}
            >
              <option value="">All Components</option>
              {cbomData.components.map(comp => (
                <option key={comp.id} value={comp.name}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* View Mode Selector */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
            <button
              className={`px-3 py-1 rounded-md text-sm ${viewMode === 'summary' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setViewMode('summary')}
            >
              Summary
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${viewMode === 'cards' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setViewMode('cards')}
            >
              Cards
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${viewMode === 'table' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>
        </div>
      </div>
      
      {/* Display different views based on the selected mode */}
      {viewMode === 'summary' && summaryStats && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">CBOM Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">Total Assets</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{summaryStats.totalAssets}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-300">Total Components</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{summaryStats.totalComponents}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">Critical Risk Assets</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {summaryStats.riskBreakdown.critical} 
                <span className="text-sm ml-1">({summaryStats.criticalPercentage}%)</span>
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-300">High Risk Assets</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {summaryStats.riskBreakdown.high}
                <span className="text-sm ml-1">({summaryStats.highPercentage}%)</span>
              </p>
            </div>
          </div>
          
          {/* Risk Distribution */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-200">Risk Distribution</h3>
            <div className="h-6 w-full flex rounded-md overflow-hidden">
              {Object.entries(summaryStats.riskBreakdown).map(([risk, count]) => {
                if (count === 0) return null;
                const percentage = (count / summaryStats.totalAssets) * 100;
                let bgColor = '';
                
                switch(risk) {
                  case 'critical': bgColor = 'bg-red-600'; break;
                  case 'high': bgColor = 'bg-orange-500'; break;
                  case 'medium': bgColor = 'bg-yellow-500'; break;
                  case 'low': bgColor = 'bg-blue-500'; break;
                  case 'none': bgColor = 'bg-green-500'; break;
                  default: bgColor = 'bg-gray-500';
                }
                
                return (
                  <div 
                    key={risk}
                    className={`${bgColor} h-full`}
                    style={{ width: `${percentage}%` }}
                    title={`${risk}: ${count} (${Math.round(percentage)}%)`}
                  ></div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-red-600 mr-1 rounded-sm"></span>
                Critical: {summaryStats.riskBreakdown.critical}
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-orange-500 mr-1 rounded-sm"></span>
                High: {summaryStats.riskBreakdown.high}
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-yellow-500 mr-1 rounded-sm"></span>
                Medium: {summaryStats.riskBreakdown.medium}
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-blue-500 mr-1 rounded-sm"></span>
                Low: {summaryStats.riskBreakdown.low}
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 mr-1 rounded-sm"></span>
                None: {summaryStats.riskBreakdown.none}
              </div>
            </div>
          </div>
          
          {/* Vulnerability Distribution */}
          <div>
            <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-200">Vulnerability Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <p className="text-sm font-semibold">Shor's Algorithm:</p>
                <p className="text-lg">{summaryStats.vulnerabilityBreakdown.shors}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <p className="text-sm font-semibold">Grover's Algorithm:</p>
                <p className="text-lg">{summaryStats.vulnerabilityBreakdown.grovers}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <p className="text-sm font-semibold">Quantum-Resistant:</p>
                <p className="text-lg">{summaryStats.vulnerabilityBreakdown.quantum_resistant}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Card View */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {filteredComponents.map(component => (
            <div key={component.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {component.name}
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({component.assets.length} assets)
                  </span>
                </h2>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {component.assets.map(asset => (
                    <AssetCard key={asset.id} asset={asset} />
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {filteredComponents.length === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-md">
              No components or assets match your filter criteria.
            </div>
          )}
        </div>
      )}
      
      {/* Table View */}
      {viewMode === 'table' && (
        <div className="space-y-6">
          {filteredComponents.map(component => (
            <div key={component.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-x-auto">
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {component.name}
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({component.assets.length} assets)
                  </span>
                </h2>
              </div>
              
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Asset
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Risk
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vulnerability
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {component.assets.map(asset => (
                    <tr key={asset.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {asset.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {asset.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${RISK_COLORS[asset.risk_level]}`}>
                          {asset.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {asset.vulnerability_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
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
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-md">
              No components or assets match your filter criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Asset Card Component
const AssetCard: React.FC<{ asset: CryptographicAsset }> = ({ asset }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
      <div className={`px-4 py-2 font-semibold ${RISK_COLORS[asset.risk_level]}`}>
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

export default CBOMViewer; 