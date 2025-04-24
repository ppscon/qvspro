/**
 * Vulnerability Exploitability eXchange (VEX) Type Definitions
 * 
 * These types define the structure for VEX data that provides context
 * about the exploitability of vulnerabilities identified in the CBOM.
 */

// VEX status values as defined in the VEX standard
export type VexStatus = 
  | 'not_affected' 
  | 'affected' 
  | 'fixed' 
  | 'under_investigation';

// Justification codes for 'not_affected' status
export type VexJustification = 
  | 'component_not_present' 
  | 'vulnerable_code_not_present' 
  | 'vulnerable_code_not_in_execute_path' 
  | 'vulnerable_code_cannot_be_controlled_by_adversary' 
  | 'inline_mitigations_already_exist'
  | 'not_applicable';

// Impact statement for affected vulnerabilities
export type VexImpact = 
  | 'critical' 
  | 'high' 
  | 'medium' 
  | 'low' 
  | 'none';

// VEX document for a specific vulnerability
export interface VexDocument {
  id: string;
  vulnerability_id: string;  // Reference to the vulnerability (e.g., CVE ID or internal ID)
  asset_id: string;          // Reference to the specific cryptographic asset
  status: VexStatus;
  status_notes?: string;
  justification?: VexJustification;
  impact?: VexImpact;
  impact_statement?: string;
  remediation_deadline?: string;
  remediation_plan?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Extended CryptographicAsset with VEX data
export interface CryptographicAssetWithVex {
  asset_id: string;
  vex_data?: VexDocument;
}

// Collection of VEX documents for a CBOM
export interface VexCollection {
  cbom_id: string;
  documents: VexDocument[];
  last_updated: string;
} 