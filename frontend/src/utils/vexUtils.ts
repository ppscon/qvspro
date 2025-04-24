import { VexDocument, VexStatus, VexCollection } from '../types/vex';
import { CryptographicAsset, CBOMInventory } from '../types/cbom';

/**
 * Utility functions for managing VEX (Vulnerability Exploitability eXchange) data
 */

// Mock VEX data - in production, this would be fetched from an API
export const mockVexDocuments: VexDocument[] = [
  {
    id: 'vex-1',
    vulnerability_id: 'QVS-2025-001',
    asset_id: 'asset-123',
    status: 'not_affected',
    justification: 'vulnerable_code_not_in_execute_path',
    status_notes: 'The vulnerable code exists but is not in the execution path for this deployment.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'vex-2',
    vulnerability_id: 'QVS-2025-002',
    asset_id: 'asset-456',
    status: 'affected',
    impact: 'medium',
    impact_statement: 'This vulnerability could potentially allow an attacker to access encrypted data if they have quantum computing resources.',
    remediation_plan: 'Upgrade to a post-quantum cryptographic algorithm in the next release.',
    remediation_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'vex-3',
    vulnerability_id: 'QVS-2025-003',
    asset_id: 'asset-789',
    status: 'fixed',
    status_notes: 'This vulnerability was fixed in version 2.0.0 by upgrading the cryptographic library.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'vex-4',
    vulnerability_id: 'QVS-2025-004',
    asset_id: 'asset-101112',
    status: 'under_investigation',
    status_notes: 'We are currently investigating the potential impact of this vulnerability.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * Fetches VEX documents for a given CBOM
 * @param cbomId CBOM identifier
 * @returns Promise resolving to VEX collection
 */
export const fetchVexDocuments = async (cbomId: string): Promise<VexCollection> => {
  // In a real implementation, this would make an API call
  // For now, we'll use our mock data
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    cbom_id: cbomId,
    documents: mockVexDocuments,
    last_updated: new Date().toISOString()
  };
};

/**
 * Gets a VEX document for a specific asset if available
 * @param assetId Asset identifier
 * @param vexDocuments Array of VEX documents
 * @returns VEX document or undefined if none exists
 */
export const getVexDocumentForAsset = (
  assetId: string, 
  vexDocuments: VexDocument[]
): VexDocument | undefined => {
  return vexDocuments.find(doc => doc.asset_id === assetId);
};

/**
 * Enhances a CBOM with VEX data
 * @param cbom CBOM inventory
 * @param vexDocuments VEX documents
 * @returns Enhanced CBOM with VEX data
 */
export const enhanceCbomWithVexData = (
  cbom: CBOMInventory, 
  vexDocuments: VexDocument[]
): CBOMInventory => {
  const enhancedComponents = cbom.components.map(component => {
    const enhancedAssets = component.assets.map(asset => {
      const vexDoc = getVexDocumentForAsset(asset.id, vexDocuments);
      
      if (vexDoc) {
        return {
          ...asset,
          vex_status: vexDoc.status,
          vex_document_id: vexDoc.id
        };
      }
      
      return asset;
    });
    
    return {
      ...component,
      assets: enhancedAssets
    };
  });
  
  return {
    ...cbom,
    components: enhancedComponents,
    vex_documents: vexDocuments,
    vex_last_updated: new Date().toISOString()
  };
};

/**
 * Determines if an asset's risk should be adjusted based on VEX data
 * @param asset The cryptographic asset
 * @param vexDocuments Array of VEX documents
 * @returns Adjusted risk level based on VEX information
 */
export const getAdjustedRiskLevel = (
  asset: CryptographicAsset, 
  vexDocuments: VexDocument[]
): { 
  adjustedRiskLevel: string, 
  reason: string 
} => {
  const vexDoc = getVexDocumentForAsset(asset.id, vexDocuments);
  
  if (!vexDoc) {
    return { 
      adjustedRiskLevel: asset.risk_level, 
      reason: 'No VEX data available'
    };
  }
  
  // Logic to adjust risk based on VEX status
  switch (vexDoc.status) {
    case 'not_affected':
      return { 
        adjustedRiskLevel: 'None', 
        reason: `Not affected: ${vexDoc.justification?.replace(/_/g, ' ')}` 
      };
      
    case 'fixed':
      return { 
        adjustedRiskLevel: 'None', 
        reason: 'Fixed in the current version' 
      };
      
    case 'affected':
      // Keep the original risk level
      return { 
        adjustedRiskLevel: asset.risk_level, 
        reason: 'Confirmed affected' 
      };
      
    case 'under_investigation':
      // Could potentially lower the risk slightly since it's not confirmed
      return { 
        adjustedRiskLevel: asset.risk_level, 
        reason: 'Under investigation' 
      };
      
    default:
      return { 
        adjustedRiskLevel: asset.risk_level, 
        reason: 'Unknown VEX status' 
      };
  }
}; 