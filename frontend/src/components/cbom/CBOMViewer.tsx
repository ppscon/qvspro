import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import VexStatusBadge from './VexStatusBadge';
import VexDetailPanel from './VexDetailPanel';
import useVexData from '../../hooks/useVexData';
import VexStatusChart from './VexStatusChart';

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
const AssetCard: React.FC<{ 
  asset: CryptographicAsset,
  onViewVexDetails?: (assetId: string) => void 
}> = ({ asset, onViewVexDetails }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
      <div className={`px-4 py-2 font-semibold ${RISK_COLORS[asset.risk_level].tailwind} flex justify-between items-center`}>
        <span>{asset.name}</span>
        {asset.vex_status && (
          <VexStatusBadge status={asset.vex_status} compact={true} />
        )}
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
        
        {/* VEX Details Button */}
        {asset.vex_status && onViewVexDetails && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => onViewVexDetails(asset.id)}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View Exploitability Details
            </button>
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
  const [filterVexStatus, setFilterVexStatus] = useState<string>('All');
  const [showVexModal, setShowVexModal] = useState<boolean>(false);
  
  // Use the VEX data hook
  const {
    enhancedCbom,
    selectedVexDocument,
    isLoadingVex,
    vexError,
    viewVexDetails,
    closeVexDetails
  } = useVexData(cbomData);
  
  // Handle export functions
  const handleExportJSON = useCallback(() => {
    if (enhancedCbom) {
      exportCBOMAsJSON(enhancedCbom, `cbom_export_${new Date().toISOString().slice(0, 10)}.json`);
    }
  }, [enhancedCbom]);
  
  const handleExportCSV = useCallback(() => {
    if (enhancedCbom) {
      exportCBOMAsCSV(enhancedCbom, `cbom_export_${new Date().toISOString().slice(0, 10)}.csv`);
    }
  }, [enhancedCbom]);
  
  // Filter and sort assets based on search query, risk level, and VEX status
  const filteredComponents = useMemo(() => {
    if (!enhancedCbom) return [];
    
    return enhancedCbom.components.map(component => {
      // Filter assets based on search query, risk level, and VEX status
      const filteredAssets = component.assets.filter(asset => {
        const matchesSearch = 
          searchQuery === '' || 
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.file_path?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRisk = 
          filterRisk === 'All' || 
          asset.risk_level === filterRisk;
        
        const matchesVexStatus = 
          filterVexStatus === 'All' || 
          (filterVexStatus === 'No VEX Data' && !asset.vex_status) ||
          (asset.vex_status === filterVexStatus);
        
        return matchesSearch && matchesRisk && matchesVexStatus;
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
  }, [enhancedCbom, searchQuery, filterRisk, filterVexStatus, activeComponent]);
  
  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!enhancedCbom) return null;
    
    const { risk_summary, vulnerability_summary, total_assets, components } = enhancedCbom;

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
  }, [enhancedCbom]);

  // Example scan metadata (replace with real data as needed)
  const scanMeta = {
    date: new Date().toLocaleDateString(),
    scanId: enhancedCbom?.id || 'N/A',
  };

  // Optionally, allow user to customize recipient/audience in the future
  const recipient = undefined;

  // QVS PDF Export Button
const handleQvsExportPdf = useCallback(() => {
  if (!enhancedCbom) return;
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
    assessmentDate: enhancedCbom.generated_at,
    username: 'QVS Security',
    darkMode: false
  });
  exportQvsToPdf(html, { title: 'QVS_CBOM_Summary_Report' });
}, [enhancedCbom, summaryStats]);

const pdfExportButton = (
  <button
    onClick={handleQvsExportPdf}
    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md text-sm"
  >
    Export PDF Summary
  </button>
);

  // Display VEX modal if a document is selected
  useEffect(() => {
    setShowVexModal(!!selectedVexDocument);
  }, [selectedVexDocument]);
  
  if (isLoading || isLoadingVex) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" aria-label="Loading"></div>
        <span className="sr-only">Loading</span>
      </div>
    );
  }
  
  if (error || vexError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error || vexError}</span>
      </div>
    );
  }
  
  if (!enhancedCbom) {
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
            Generated: {new Date(enhancedCbom.generated_at).toLocaleString()}
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
      
      {/* Filters */}
      <div className="bg-gray-800 shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-300">Search Assets</label>
            <input
              type="text"
              id="search"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name, description, or file path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="risk-filter" className="block text-sm font-medium text-gray-300">Risk Level</label>
            <select
              id="risk-filter"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          
          {/* VEX Status Filter */}
          <div>
            <label htmlFor="vex-filter" className="block text-sm font-medium text-gray-300">VEX Status</label>
            <select
              id="vex-filter"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterVexStatus}
              onChange={(e) => setFilterVexStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="not_affected">Not Affected</option>
              <option value="affected">Affected</option>
              <option value="fixed">Fixed</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="No VEX Data">No VEX Data</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="component-filter" className="block text-sm font-medium text-gray-300">Component</label>
            <select
              id="component-filter"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={activeComponent || ''}
              onChange={(e) => setActiveComponent(e.target.value || null)}
            >
              <option value="">All Components</option>
              {enhancedCbom.components.map(comp => (
                <option key={comp.id || comp.name} value={comp.name}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="view-mode" className="block text-sm font-medium text-gray-300">View Mode</label>
            <select
              id="view-mode"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'table' | 'cards' | 'summary')}
            >
              <option value="summary">Summary</option>
              <option value="cards">Card View</option>
              <option value="table">Table View</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Summary View */}
      {viewMode === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <div className="flex-1 min-w-[300px]">
              <RiskPieChart cbomData={enhancedCbom} />
            </div>
          </div>
          
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <div className="flex-1 min-w-[300px]">
              <VulnTypeBarChart cbomData={enhancedCbom} />
            </div>
          </div>
          
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <div className="flex-1 min-w-[300px]">
              <AssetTypeBarChart cbomData={enhancedCbom} />
            </div>
          </div>
          
          {/* Add VEX Status Chart */}
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <div className="flex-1 min-w-[300px] min-h-[300px]">
              <VexStatusChart cbomData={enhancedCbom} />
            </div>
          </div>
        </div>
      )}
      
      {/* CBOM Cards View - Updated to include VEX details */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredComponents.map(component => (
            <React.Fragment key={component.id}>
              {component.assets.map(asset => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset} 
                  onViewVexDetails={viewVexDetails} 
                />
              ))}
            </React.Fragment>
          ))}
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
      
      {/* VEX Details Modal */}
      {showVexModal && selectedVexDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <VexDetailPanel 
              vexDocument={selectedVexDocument} 
              onClose={closeVexDetails} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CBOMViewer;