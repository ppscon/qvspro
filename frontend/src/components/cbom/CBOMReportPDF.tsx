import React from 'react';
import { CBOMInventory, CryptographicAsset, RiskLevel } from '../../types/cbom';
import { FiAlertTriangle, FiCheckCircle, FiFileText, FiPrinter, FiX } from 'react-icons/fi';
import { exportQvsToPdf } from '../../utils/qvsBasicExportUtils';
import { generateQVSReportHtml } from '../../utils/qvsReportFormatUtils';

// Define interface for recommendation items
interface Recommendation {
  title: string;
  description: string;
  priority: string;
  timeframe: string;
}

interface CBOMReportPDFProps {
  cbomData: CBOMInventory;
  summaryStats: any;
  onClose: () => void;
}

// Risk level color mapping
const getRiskColor = (riskLevel: RiskLevel, darkMode: boolean = false) => {
  switch (riskLevel) {
    case 'Critical':
      return darkMode ? 'text-red-400' : 'text-red-600';
    case 'High':
      return darkMode ? 'text-orange-400' : 'text-orange-600';
    case 'Medium':
      return darkMode ? 'text-yellow-400' : 'text-yellow-600';
    case 'Low':
      return darkMode ? 'text-blue-400' : 'text-blue-600';
    case 'None':
      return darkMode ? 'text-green-400' : 'text-green-600';
    default:
      return darkMode ? 'text-gray-400' : 'text-gray-600';
  }
};

const getBgRiskColor = (riskLevel: RiskLevel, darkMode: boolean = false) => {
  switch (riskLevel) {
    case 'Critical':
      return darkMode ? 'bg-red-900/20' : 'bg-red-50';
    case 'High':
      return darkMode ? 'bg-orange-900/20' : 'bg-orange-50';
    case 'Medium':
      return darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50';
    case 'Low':
      return darkMode ? 'bg-blue-900/20' : 'bg-blue-50';
    case 'None':
      return darkMode ? 'bg-green-900/20' : 'bg-green-50';
    default:
      return darkMode ? 'bg-gray-900/20' : 'bg-gray-50';
  }
};

const CBOMReportPDF: React.FC<CBOMReportPDFProps> = ({ cbomData, summaryStats, onClose }) => {
  const darkMode = false; // Always use light mode for print-friendly reports
  const dateFormatted = new Date(cbomData.generated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format number as percentage with 1 decimal point
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Get trend analysis
  const getTrendingAnalysis = () => {
    const { criticalPercentage, highPercentage } = summaryStats;
    const severity = criticalPercentage > 10 ? 'critical' : 
                     highPercentage > 20 ? 'concerning' :
                     'moderate';
    
    return {
      severity,
      recommendation: severity === 'critical' 
        ? 'Immediate remediation required for critical cryptographic vulnerabilities'
        : severity === 'concerning'
        ? 'Prioritize addressing high-risk cryptographic issues in next sprint'
        : 'Continue monitoring and address vulnerabilities in regular maintenance cycles'
    };
  };

  const trendAnalysis = getTrendingAnalysis();

  // Find top 5 most critical components based on number of critical/high risk assets
  const getTopRiskComponents = () => {
    return cbomData.components
      .map(component => {
        const criticalAssets = component.assets.filter(a => a.risk_level === 'Critical').length;
        const highAssets = component.assets.filter(a => a.risk_level === 'High').length;
        return {
          name: component.name,
          criticalAssets,
          highAssets,
          totalAssets: component.assets.length,
          score: (criticalAssets * 10) + (highAssets * 3)
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const topRiskComponents = getTopRiskComponents();

  // Generate asset type breakdown data
  const getAssetTypeBreakdown = () => {
    const breakdown = summaryStats.assetTypeBreakdown;
    return Object.keys(breakdown).map(type => ({
      type,
      count: breakdown[type],
      percentage: (breakdown[type] / summaryStats.totalAssets) * 100
    })).sort((a, b) => b.count - a.count);
  };

  const assetTypeBreakdown = getAssetTypeBreakdown();

  // Build remediation recommendations based on scan data
  const getRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // Check for critical vulnerabilities
    if (summaryStats.riskBreakdown.critical > 0) {
      recommendations.push({
        title: 'Address Critical Cryptographic Vulnerabilities',
        description: 'Immediately remediate critical cryptographic issues that could expose systems to quantum attacks.',
        priority: 'High',
        timeframe: '30 days'
      });
    }
    
    // Check for outdated algorithms
    const hasVulnerableRSA = cbomData.components.some(comp => 
      comp.assets.some(asset => 
        asset.vulnerability_type?.toLowerCase().includes('rsa') && 
        asset.risk_level === 'High'
      )
    );
    
    if (hasVulnerableRSA) {
      recommendations.push({
        title: 'Migrate From RSA to Quantum-Resistant Alternatives',
        description: 'Replace RSA implementations with NIST-approved post-quantum cryptography standards.',
        priority: 'High',
        timeframe: '90 days'
      });
    }
    
    // Always recommend cryptographic inventory
    recommendations.push({
      title: 'Maintain Comprehensive Cryptographic Inventory',
      description: 'Continue regular CBOM scans to maintain visibility into cryptographic assets across your environment.',
      priority: 'Medium',
      timeframe: 'Ongoing'
    });
    
    // Check for key management issues
    const hasKeyManagementIssues = cbomData.components.some(comp => 
      comp.assets.some(asset => 
        asset.vulnerability_type?.toLowerCase().includes('key management')
      )
    );
    
    if (hasKeyManagementIssues) {
      recommendations.push({
        title: 'Improve Cryptographic Key Management',
        description: 'Implement formal key rotation schedules and secure storage practices for cryptographic keys.',
        priority: 'Medium',
        timeframe: '60 days'
      });
    }
    
    // Always recommend cryptographic agility
    recommendations.push({
      title: 'Enhance Cryptographic Agility',
      description: 'Implement cryptographic agility frameworks to facilitate easier migration between algorithms as standards evolve.',
      priority: 'Medium',
      timeframe: '180 days'
    });
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  // Handle print button click - generate PDF
  const handlePrint = () => {
    const reportHtml = generateQVSReportHtml(`
      <div class="qvs-report">
        <div class="page">
          <h2>Executive Summary</h2>
          <p>This Cryptographic Bill of Materials (CBOM) report provides a comprehensive analysis of cryptographic assets across your environment. The assessment identifies cryptographic vulnerabilities, quantum-vulnerable algorithms, and provides actionable remediation guidance.</p>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">Total Components</div>
              <div class="metric-value">${summaryStats.totalComponents}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Total Assets</div>
              <div class="metric-value">${summaryStats.totalAssets}</div>
            </div>
            <div class="metric-card ${summaryStats.criticalPercentage > 0 ? 'critical' : ''}">
              <div class="metric-title">Critical Risk Assets</div>
              <div class="metric-value">${summaryStats.riskBreakdown.critical} <span class="metric-percent">(${formatPercent(summaryStats.criticalPercentage)})</span></div>
            </div>
            <div class="metric-card ${summaryStats.highPercentage > 15 ? 'high' : ''}">
              <div class="metric-title">High Risk Assets</div>
              <div class="metric-value">${summaryStats.riskBreakdown.high} <span class="metric-percent">(${formatPercent(summaryStats.highPercentage)})</span></div>
            </div>
          </div>
          
          <div class="key-insight ${trendAnalysis.severity === 'critical' ? 'critical' : trendAnalysis.severity === 'concerning' ? 'high' : 'moderate'}">
            <h3>Key Insight</h3>
            <p>${trendAnalysis.recommendation}</p>
          </div>
          
          <h2>Risk Analysis</h2>
          <p>The following breakdown shows the distribution of cryptographic risks across your environment:</p>
          
          <table class="risk-table">
            <thead>
              <tr>
                <th>Risk Level</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr class="risk-critical">
                <td>Critical</td>
                <td>${summaryStats.riskBreakdown.critical}</td>
                <td>${formatPercent(summaryStats.criticalPercentage)}</td>
              </tr>
              <tr class="risk-high">
                <td>High</td>
                <td>${summaryStats.riskBreakdown.high}</td>
                <td>${formatPercent(summaryStats.highPercentage)}</td>
              </tr>
              <tr class="risk-medium">
                <td>Medium</td>
                <td>${summaryStats.riskBreakdown.medium}</td>
                <td>${formatPercent((summaryStats.riskBreakdown.medium / summaryStats.totalAssets) * 100)}</td>
              </tr>
              <tr class="risk-low">
                <td>Low</td>
                <td>${summaryStats.riskBreakdown.low}</td>
                <td>${formatPercent((summaryStats.riskBreakdown.low / summaryStats.totalAssets) * 100)}</td>
              </tr>
              <tr class="risk-none">
                <td>None</td>
                <td>${summaryStats.riskBreakdown.none}</td>
                <td>${formatPercent((summaryStats.riskBreakdown.none / summaryStats.totalAssets) * 100)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="page">
          <h2>Highest Risk Components</h2>
          <p>The following components contain the highest concentration of critical and high-risk cryptographic issues:</p>
          
          <table class="components-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Critical Issues</th>
                <th>High Issues</th>
                <th>Total Assets</th>
              </tr>
            </thead>
            <tbody>
              ${topRiskComponents.map(comp => `
                <tr>
                  <td>${comp.name}</td>
                  <td class="${comp.criticalAssets > 0 ? 'highlighted-cell' : ''}">${comp.criticalAssets}</td>
                  <td class="${comp.highAssets > 0 ? 'highlighted-cell' : ''}">${comp.highAssets}</td>
                  <td>${comp.totalAssets}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2>Asset Type Distribution</h2>
          <p>The distribution of cryptographic asset types across your environment:</p>
          
          <table class="asset-table">
            <thead>
              <tr>
                <th>Asset Type</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${assetTypeBreakdown.map(item => `
                <tr>
                  <td>${item.type}</td>
                  <td>${item.count}</td>
                  <td>${formatPercent(item.percentage)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="page">
          <h2>Recommendations</h2>
          <p>Based on the cryptographic assessment, we recommend the following actions:</p>
          
          ${recommendations.map((rec, index) => `
            <div class="recommendation-card">
              <div class="recommendation-header">
                <span class="recommendation-number">${index + 1}</span>
                <span class="recommendation-title">${rec.title}</span>
                <span class="recommendation-priority priority-${rec.priority.toLowerCase()}">${rec.priority}</span>
              </div>
              <div class="recommendation-body">
                <p>${rec.description}</p>
                <p class="recommendation-timeframe">Recommended timeframe: <strong>${rec.timeframe}</strong></p>
              </div>
            </div>
          `).join('')}
          
          <div class="methodology-section">
            <h3>Assessment Methodology</h3>
            <p>This report was generated using QVS Pro, which identifies cryptographic assets through static and dynamic analysis. Risk levels are assigned based on:</p>
            <ul>
              <li><strong>Critical:</strong> Known vulnerabilities to quantum computing with high exploitability</li>
              <li><strong>High:</strong> Cryptographic implementations vulnerable to quantum computing</li>
              <li><strong>Medium:</strong> Non-optimal cryptographic implementations with potential weaknesses</li>
              <li><strong>Low:</strong> Minor cryptographic configuration issues</li>
              <li><strong>None:</strong> Quantum-resistant cryptographic implementations</li>
            </ul>
          </div>
        </div>
      </div>
    `, {
      title: 'QVS Pro Cryptographic Assessment',
      assessmentDate: cbomData.generated_at,
      username: 'QVS Security',
      darkMode: false,
      includeStyles: true,
      execSummary: `This assessment generated on ${dateFormatted} identified ${summaryStats.totalAssets} cryptographic assets across ${summaryStats.totalComponents} components. ${summaryStats.criticalPercentage > 0 ? `Critical issues were found that require immediate attention.` : 'No critical issues were found, but ongoing monitoring is recommended.'}`
    });
    
    exportQvsToPdf(reportHtml, { 
      title: `QVS_CBOM_Report_${new Date().toISOString().slice(0, 10)}`,
      printAutomatically: true
    });
  };

  return (
    <div className="bg-white text-gray-900 overflow-y-auto">
      {/* Header with Print/Close buttons */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold flex items-center">
          <FiFileText className="mr-2" /> CBOM Assessment Report
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FiPrinter className="mr-2" /> Print Report
          </button>
          <button
            onClick={onClose}
            className="flex items-center p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <FiX />
          </button>
        </div>
      </div>

      {/* Report Content - Executive Summary */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Executive Summary</h1>
          <p className="mb-4">
            This Cryptographic Bill of Materials (CBOM) report provides a comprehensive analysis of cryptographic assets across your environment. 
            The assessment identifies cryptographic vulnerabilities, quantum-vulnerable algorithms, and provides actionable remediation guidance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-gray-100">
              <div className="text-sm font-medium mb-1">Total Components</div>
              <div className="text-2xl font-bold">{summaryStats.totalComponents}</div>
            </div>

            <div className="p-4 rounded-lg bg-gray-100">
              <div className="text-sm font-medium mb-1">Total Assets</div>
              <div className="text-2xl font-bold">{summaryStats.totalAssets}</div>
            </div>

            <div className={`p-4 rounded-lg ${summaryStats.criticalPercentage > 0 ? 'bg-red-50' : 'bg-gray-100'}`}>
              <div className="text-sm font-medium mb-1">Critical Risk</div>
              <div className={`text-2xl font-bold ${summaryStats.criticalPercentage > 0 ? 'text-red-600' : ''}`}>
                {summaryStats.riskBreakdown.critical}
                <span className="text-base font-normal ml-1">
                  ({formatPercent(summaryStats.criticalPercentage)})
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${summaryStats.highPercentage > 15 ? 'bg-orange-50' : 'bg-gray-100'}`}>
              <div className="text-sm font-medium mb-1">High Risk</div>
              <div className={`text-2xl font-bold ${summaryStats.highPercentage > 15 ? 'text-orange-600' : ''}`}>
                {summaryStats.riskBreakdown.high}
                <span className="text-base font-normal ml-1">
                  ({formatPercent(summaryStats.highPercentage)})
                </span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-l-4 ${
            trendAnalysis.severity === 'critical' 
              ? 'border-red-500 bg-red-50' 
              : trendAnalysis.severity === 'concerning'
              ? 'border-orange-500 bg-orange-50'
              : 'border-blue-500 bg-blue-50'
          }`}>
            <h3 className="font-medium mb-1">Key Insight</h3>
            <p className="text-sm">
              {trendAnalysis.recommendation}
            </p>
          </div>
        </div>

        {/* Risk Analysis Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Risk Analysis</h2>
          
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mb-6">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Risk Level
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Count
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr className="hover:bg-red-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-red-700 sm:pl-6">
                    Critical
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {summaryStats.riskBreakdown.critical}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {formatPercent(summaryStats.criticalPercentage)}
                  </td>
                </tr>
                <tr className="hover:bg-orange-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-orange-700 sm:pl-6">
                    High
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {summaryStats.riskBreakdown.high}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {formatPercent(summaryStats.highPercentage)}
                  </td>
                </tr>
                <tr className="hover:bg-yellow-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-yellow-700 sm:pl-6">
                    Medium
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {summaryStats.riskBreakdown.medium}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {formatPercent((summaryStats.riskBreakdown.medium / summaryStats.totalAssets) * 100)}
                  </td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-blue-700 sm:pl-6">
                    Low
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {summaryStats.riskBreakdown.low}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {formatPercent((summaryStats.riskBreakdown.low / summaryStats.totalAssets) * 100)}
                  </td>
                </tr>
                <tr className="hover:bg-green-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-green-700 sm:pl-6">
                    None
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {summaryStats.riskBreakdown.none}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {formatPercent((summaryStats.riskBreakdown.none / summaryStats.totalAssets) * 100)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Highest Risk Components */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Highest Risk Components</h2>
          <p className="mb-4">The following components contain the highest concentration of critical and high-risk cryptographic issues:</p>
          
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mb-6">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Component
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Critical Issues
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    High Issues
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Total Assets
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {topRiskComponents.map((comp, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {comp.name}
                    </td>
                    <td className={`whitespace-nowrap px-3 py-4 text-sm ${comp.criticalAssets > 0 ? 'font-semibold text-red-700 bg-red-50' : 'text-gray-500'}`}>
                      {comp.criticalAssets}
                    </td>
                    <td className={`whitespace-nowrap px-3 py-4 text-sm ${comp.highAssets > 0 ? 'font-semibold text-orange-700 bg-orange-50' : 'text-gray-500'}`}>
                      {comp.highAssets}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {comp.totalAssets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Asset Type Distribution */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Asset Type Distribution</h2>
          <p className="mb-4">The distribution of cryptographic asset types across your environment:</p>
          
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mb-6">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Asset Type
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Count
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {assetTypeBreakdown.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {item.type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {item.count}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatPercent(item.percentage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <p className="mb-4">Based on the cryptographic assessment, we recommend the following actions:</p>
          
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rec.priority === 'High' 
                      ? 'bg-red-100 text-red-800' 
                      : rec.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended timeframe: <span className="font-semibold">{rec.timeframe}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology Section */}
        <div className="mb-8">
          <details className="border border-gray-200 rounded-lg">
            <summary className="cursor-pointer text-lg font-semibold px-4 py-3 bg-gray-50 rounded-t-lg focus:outline-none">
              Assessment Methodology
            </summary>
            <div className="px-4 py-3">
              <p className="mb-2 text-sm text-gray-600">
                This report was generated using QVS Pro, which identifies cryptographic assets through static and dynamic analysis. Risk levels are assigned based on:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li><strong>Critical:</strong> Known vulnerabilities to quantum computing with high exploitability</li>
                <li><strong>High:</strong> Cryptographic implementations vulnerable to quantum computing</li>
                <li><strong>Medium:</strong> Non-optimal cryptographic implementations with potential weaknesses</li>
                <li><strong>Low:</strong> Minor cryptographic configuration issues</li>
                <li><strong>None:</strong> Quantum-resistant cryptographic implementations</li>
              </ul>
            </div>
          </details>
        </div>

        {/* Report Footer */}
        <div className="border-t border-gray-200 pt-4 mt-8 text-sm text-gray-500 text-center">
          <p>Quantum Vulnerability Scanner &copy; 2025</p>
          <p>Generated on {dateFormatted}</p>
        </div>
      </div>
    </div>
  );
};

export default CBOMReportPDF; 