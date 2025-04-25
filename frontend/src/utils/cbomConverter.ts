/**
 * CBOM Converter Utilities
 * 
 * These utilities convert scan results into a structured CBOM format
 * for better organization, analysis, and reporting.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  CryptographicAsset, 
  CBOMComponent, 
  CBOMInventory,
  AlgorithmType,
  VulnerabilityType,
  RiskLevel,
  AssetGraph,
  AssetNode,
  AssetEdge,
  RiskSummary
} from '../types/cbom';

/**
 * Determines the algorithm type based on the scan result
 */
export const determineAlgorithmType = (algorithm: string, method?: string): AlgorithmType => {
  const algorithmLower = algorithm.toLowerCase();
  
  if (algorithmLower.includes('aes') || 
      algorithmLower.includes('3des') || 
      algorithmLower.includes('blowfish') || 
      algorithmLower.includes('chacha')) {
    return 'SymmetricKey';
  }
  
  if (algorithmLower.includes('rsa') || 
      algorithmLower.includes('ecc') || 
      algorithmLower.includes('dsa')) {
    return 'PublicKey';
  }
  
  if (algorithmLower.includes('sha') || 
      algorithmLower.includes('md5') || 
      algorithmLower.includes('blake')) {
    return 'Hash';
  }
  
  if (algorithmLower.includes('dh') || 
      algorithmLower.includes('ecdh') || 
      method?.toLowerCase().includes('key exchange')) {
    return 'KeyExchange';
  }
  
  if (algorithmLower.includes('hmac') || 
      algorithmLower.includes('cmac') || 
      algorithmLower.includes('poly1305')) {
    return 'MAC';
  }
  
  if (algorithmLower.includes('dilithium') || 
      algorithmLower.includes('kyber') || 
      algorithmLower.includes('sphincs')) {
    return 'PostQuantum';
  }
  
  if (algorithmLower.includes('random') || 
      algorithmLower.includes('prng') || 
      algorithmLower.includes('csprng')) {
    return 'Random';
  }
  
  return 'Other';
};

/**
 * Converts raw scan results to a structured CBOM asset
 */
export const convertResultToAsset = (result: any): CryptographicAsset => {
  // Extract and normalize fields
  const filePath = result.file_path || result.file || '';
  const algorithm = result.algorithm || result.algorithm_name || 'Unknown';
  const vulnerability = result.vulnerability_type || result.vulnerability || result.type || 'Unknown';
  const risk = result.risk_level || result.risk || 'Unknown';
  const line = result.line_number || result.line || 0;
  
  // Extract component from file path if possible
  const pathParts = filePath.split('/');
  const component = pathParts.length > 1 ? pathParts[0] : 'Unknown';
  
  return {
    id: uuidv4(),
    name: algorithm,
    type: determineAlgorithmType(algorithm, result.method),
    
    // Location
    file_path: filePath,
    line_number: typeof line === 'number' ? line : parseInt(line) || 0,
    component_id: component,
    
    // Vulnerability
    vulnerability_type: vulnerability as VulnerabilityType,
    risk_level: risk as RiskLevel,
    description: result.description || `${algorithm} vulnerability detected`,
    recommendation: result.recommendation || 'Update to a quantum-safe alternative',
    
    // Default contexts based on algorithm type
    implementation_context: [determineImplementationContext(algorithm, result.method)],
  };
};

/**
 * Determines implementation context based on algorithm and method
 */
const determineImplementationContext = (algorithm: string, method?: string): any => {
  const algorithmLower = algorithm.toLowerCase();
  const methodLower = (method || '').toLowerCase();
  
  if (methodLower.includes('authentication') || 
      methodLower.includes('password')) {
    return 'Authentication';
  }
  
  if (algorithmLower.includes('aes') || 
      algorithmLower.includes('chacha') ||
      methodLower.includes('encrypt')) {
    return 'DataEncryption';
  }
  
  if (algorithmLower.includes('rsa') || 
      algorithmLower.includes('dsa') || 
      algorithmLower.includes('dilithium') ||
      methodLower.includes('sign')) {
    return 'Signatures';
  }
  
  if (algorithmLower.includes('tls') || 
      algorithmLower.includes('ssl') || 
      methodLower.includes('network')) {
    return 'Communications';
  }
  
  if (algorithmLower.includes('dh') || 
      algorithmLower.includes('kyber') || 
      methodLower.includes('key')) {
    return 'KeyManagement';
  }
  
  return 'Other';
};

/**
 * Groups assets by component
 */
export const groupAssetsByComponent = (assets: CryptographicAsset[]): CBOMComponent[] => {
  // Group assets by component
  const componentMap: Record<string, CryptographicAsset[]> = {};
  
  assets.forEach(asset => {
    const componentName = asset.component_id || 'Unknown';
    if (!componentMap[componentName]) {
      componentMap[componentName] = [];
    }
    componentMap[componentName].push(asset);
  });
  
  // Convert to component structure
  return Object.entries(componentMap).map(([name, componentAssets]) => ({
    id: uuidv4(),
    name,
    type: 'Software Component',
    description: `Component ${name} containing ${componentAssets.length} cryptographic assets`,
    assets: componentAssets,
    version: '1.0.0',  // Default version
  }));
};

/**
 * Converts scan results to a CBOM inventory
 */
export const convertScanToCBOM = (scanResults: any): CBOMInventory => {
  if (!scanResults || !scanResults.results || !Array.isArray(scanResults.results)) {
    throw new Error('Invalid scan results format');
  }
  
  // Convert each result to a cryptographic asset
  const assets = scanResults.results.map(convertResultToAsset);
  
  // Group assets by component
  const components = groupAssetsByComponent(assets);
  
  // Calculate statistics
  const riskCounts: RiskSummary = {
    critical: assets.filter((a: CryptographicAsset) => a.risk_level === 'Critical').length,
    high: assets.filter((a: CryptographicAsset) => a.risk_level === 'High').length,
    medium: assets.filter((a: CryptographicAsset) => a.risk_level === 'Medium').length,
    low: assets.filter((a: CryptographicAsset) => a.risk_level === 'Low').length,
    none: assets.filter((a: CryptographicAsset) => a.risk_level === 'None').length,
    unknown: assets.filter((a: CryptographicAsset) => a.risk_level === 'Unknown').length
  };
  
  const vulnCounts = {
    shors: assets.filter((a: CryptographicAsset) => a.vulnerability_type === "Shor's Algorithm").length,
    grovers: assets.filter((a: CryptographicAsset) => a.vulnerability_type === "Grover's Algorithm").length,
    quantum_resistant: assets.filter((a: CryptographicAsset) => a.vulnerability_type === 'Quantum-Resistant').length,
    none: assets.filter((a: CryptographicAsset) => a.vulnerability_type === 'None').length,
    unknown: assets.filter((a: CryptographicAsset) => a.vulnerability_type === 'Unknown').length,
  };
  
  // Create CBOM inventory
  return {
    id: uuidv4(),
    name: 'Cryptographic Bill of Materials',
    description: `Generated from scan of ${scanResults.scanned_files?.length || 'unknown'} files`,
    version: '1.0',
    generated_at: new Date().toISOString(),
    components,
    total_assets: assets.length,
    risk_summary: riskCounts,
    vulnerability_summary: vulnCounts,
  };
};

/**
 * Create a graph representation of the CBOM for visualization
 */
export const createAssetGraph = (cbom: CBOMInventory): AssetGraph => {
  const nodes: AssetNode[] = [];
  const edges: AssetEdge[] = [];
  
  // Process all assets in all components
  cbom.components.forEach(component => {
    component.assets.forEach(asset => {
      // Add node for this asset
      nodes.push({
        id: asset.id,
        label: asset.name,
        type: asset.type,
        risk_level: asset.risk_level,
        component_id: component.name,
      });
      
      // Add edges for dependencies if they exist
      if (asset.dependencies && asset.dependencies.length > 0) {
        asset.dependencies.forEach(depId => {
          edges.push({
            source: asset.id,
            target: depId,
            label: 'depends_on'
          });
        });
      }
    });
  });
  
  return { nodes, edges };
};

/**
 * Export CBOM as JSON file
 */
export const exportCBOMAsJSON = (cbom: CBOMInventory, filename: string = 'cbom_export.json'): void => {
  const jsonContent = JSON.stringify(cbom, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export CBOM as CSV file (simplified format)
 */
export const exportCBOMAsCSV = (cbom: CBOMInventory, filename: string = 'cbom_export.csv'): void => {
  // Flatten the CBOM structure for CSV format
  const rows: any[] = [];
  
  cbom.components.forEach(component => {
    component.assets.forEach(asset => {
      rows.push({
        component: component.name,
        asset: asset.name,
        type: asset.type,
        file_path: asset.file_path || 'N/A',
        line_number: asset.line_number || 'N/A',
        vulnerability: asset.vulnerability_type,
        risk: asset.risk_level,
        context: asset.implementation_context?.join(', ') || 'Unknown',
        description: asset.description || 'N/A',
        recommendation: asset.recommendation || 'N/A',
      });
    });
  });
  
  // Convert to CSV
  const headers = [
    'Component', 'Asset', 'Type', 'File Path', 'Line Number', 
    'Vulnerability', 'Risk', 'Context', 'Description', 'Recommendation'
  ];
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => [
      safeCSVField(row.component),
      safeCSVField(row.asset),
      safeCSVField(row.type),
      safeCSVField(row.file_path),
      safeCSVField(row.line_number),
      safeCSVField(row.vulnerability),
      safeCSVField(row.risk),
      safeCSVField(row.context),
      safeCSVField(row.description),
      safeCSVField(row.recommendation),
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export CBOM as XLSX file with multiple sheets (detailed format)
 * Requires xlsx library: npm install xlsx
 */
export const exportCBOMAsXLSX = async (cbom: CBOMInventory, filename: string = 'cbom_export.xlsx'): Promise<void> => {
  try {
    // Define process.browser manually before importing xlsx
    if (typeof window !== 'undefined') {
      window.process = window.process || {};
      (window.process as any).browser = true;
    }
    
    // Import XLSX with type assertion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const XLSX = (await import('xlsx/dist/xlsx.full.min.js')) as any;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
  
    // Summary sheet
    const summaryData = [
      ['CBOM Summary Report', ''],
      ['Generated At', new Date(cbom.generated_at).toLocaleString()],
      ['Total Components', cbom.components.length.toString()],
      ['Total Assets', cbom.total_assets.toString()],
      [''],
      ['Risk Summary', ''],
      ['Critical', cbom.risk_summary.critical.toString()],
      ['High', cbom.risk_summary.high.toString()],
      ['Medium', cbom.risk_summary.medium.toString()],
      ['Low', cbom.risk_summary.low.toString()],
      ['None', cbom.risk_summary.none.toString()],
      ['Unknown', cbom.risk_summary.unknown.toString()],
      [''],
      ['Vulnerability Summary', ''],
      ["Shor's Algorithm", cbom.vulnerability_summary.shors.toString()],
      ["Grover's Algorithm", cbom.vulnerability_summary.grovers.toString()],
      ['Quantum-Resistant', cbom.vulnerability_summary.quantum_resistant.toString()],
      ['None', cbom.vulnerability_summary.none.toString()],
      ['Unknown', cbom.vulnerability_summary.unknown.toString()],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    
    // Components sheet
    const componentsHeaders = ['Component Name', 'Type', 'Description', 'Version', 'Asset Count'];
    const componentsData = cbom.components.map(component => [
      component.name,
      component.type,
      component.description,
      component.version,
      component.assets.length.toString()
    ]);
    
    const componentsSheet = XLSX.utils.aoa_to_sheet([componentsHeaders, ...componentsData]);
    XLSX.utils.book_append_sheet(wb, componentsSheet, 'Components');
    
    // Assets sheet (all assets in a flat structure)
    const assetsHeaders = [
      'Component', 'Asset', 'Type', 'File Path', 'Line Number', 
      'Vulnerability', 'Risk', 'Context', 'Description', 'Recommendation'
    ];
    
    const assetsData: string[][] = [];
    cbom.components.forEach(component => {
      component.assets.forEach(asset => {
        assetsData.push([
          component.name,
          asset.name,
          asset.type,
          asset.file_path || 'N/A',
          asset.line_number?.toString() || 'N/A',
          asset.vulnerability_type,
          asset.risk_level,
          asset.implementation_context?.join(', ') || 'Unknown',
          asset.description || 'N/A',
          asset.recommendation || 'N/A',
        ]);
      });
    });
    
    const assetsSheet = XLSX.utils.aoa_to_sheet([assetsHeaders, ...assetsData]);
    XLSX.utils.book_append_sheet(wb, assetsSheet, 'Assets');
    
    // Create individual sheets for Critical and High risk assets for quick reference
    const criticalAssetsData = [assetsHeaders];
    const highRiskAssetsData = [assetsHeaders];
    
    cbom.components.forEach(component => {
      component.assets.forEach(asset => {
        const assetRow = [
          component.name,
          asset.name,
          asset.type,
          asset.file_path || 'N/A',
          asset.line_number?.toString() || 'N/A',
          asset.vulnerability_type,
          asset.risk_level,
          asset.implementation_context?.join(', ') || 'Unknown',
          asset.description || 'N/A',
          asset.recommendation || 'N/A',
        ];
        
        if (asset.risk_level === 'Critical') {
          criticalAssetsData.push(assetRow);
        } else if (asset.risk_level === 'High') {
          highRiskAssetsData.push(assetRow);
        }
      });
    });
    
    if (criticalAssetsData.length > 1) {
      const criticalSheet = XLSX.utils.aoa_to_sheet(criticalAssetsData);
      XLSX.utils.book_append_sheet(wb, criticalSheet, 'Critical Assets');
    }
    
    if (highRiskAssetsData.length > 1) {
      const highRiskSheet = XLSX.utils.aoa_to_sheet(highRiskAssetsData);
      XLSX.utils.book_append_sheet(wb, highRiskSheet, 'High Risk Assets');
    }
    
    // Generate and download the XLSX file
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Error exporting CBOM as XLSX:', error);
  }
};

/**
 * Helper to make CSV fields safe
 */
const safeCSVField = (value: any): string => {
  const stringValue = String(value || '');
  // Escape quotes and wrap in quotes if contains special characters
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}; 