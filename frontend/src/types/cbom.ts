/**
 * Cryptographic Bill of Materials (CBOM) Type Definitions
 * 
 * These types define the structure for a comprehensive inventory of
 * cryptographic assets within an organization or system.
 */
import { VexDocument, VexStatus } from './vex';

// Risk level enumeration
export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'None' | 'Unknown';

// Vulnerability types
export type VulnerabilityType = 
  | 'Shors' 
  | 'Grovers' 
  | 'QuantumResistant' 
  | 'Unknown'
  | string; // Allow for custom vulnerability types

// Algorithm types
export type AlgorithmType = 
  | 'SymmetricKey' 
  | 'PublicKey' 
  | 'Hash' 
  | 'MAC' 
  | 'RNG' 
  | 'KDF' 
  | 'PostQuantum'
  | 'Other'
  | string; // Allow for custom algorithm types

// Asset implementation type
export type ImplementationType = 
  | 'Library' 
  | 'Custom' 
  | 'Hardware' 
  | 'Service'
  | 'Unknown';

// Individual cryptographic asset
export interface CryptographicAsset {
  id: string;
  name: string;
  type: AlgorithmType;
  implementation_type?: ImplementationType;
  description?: string;
  version?: string;
  risk_level: RiskLevel;
  vulnerability_type: VulnerabilityType;
  key_size?: number;
  component_id: string;
  file_path?: string;
  line_number?: number;
  dependencies?: string[]; // IDs of other assets this depends on
  metadata?: Record<string, any>; // Additional metadata
  implementation_context?: string[]; // Added to match usage in cbomConverter
  recommendation?: string; // Added to match usage in cbomConverter
  // VEX-related fields
  vex_status?: VexStatus;
  vex_document_id?: string; // Reference to a VEX document if available
}

// Component containing cryptographic assets
export interface CryptographicComponent {
  id: string;
  name: string;
  description?: string;
  version?: string;
  assets: CryptographicAsset[];
  // Additional fields for enhanced component info
  type?: string;
  path?: string;
  owner?: string;
  repository?: string;
}

// Risk summary counts
export interface RiskSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  none: number;
  unknown: number;
}

// Vulnerability summary counts
export interface VulnerabilitySummary {
  shors: number;
  grovers: number;
  quantum_resistant: number;
  unknown: number;
}

// Complete CBOM structure
export interface CBOMInventory {
  version: string;
  generated_at: string;
  name: string;
  description?: string;
  total_assets: number;
  components: CryptographicComponent[];
  risk_summary: RiskSummary;
  vulnerability_summary: VulnerabilitySummary;
  graph?: AssetGraph; // Optional graph representation for visualization
  id?: string; // Added to match usage in mock_cbom
  // VEX-related fields
  vex_documents?: VexDocument[]; // Associated VEX documents
  vex_last_updated?: string; // When VEX data was last updated
}

// Graph representation for asset relationships
export interface AssetGraph {
  nodes: AssetNode[];
  edges: AssetEdge[];
}

export interface AssetNode {
  id: string;
  label: string;
  name?: string; // Added to match usage in createAssetGraph
  type: AlgorithmType;
  risk_level: RiskLevel;
  component_id: string;
  component?: string; // Added to match usage in createAssetGraph
  vex_status?: VexStatus; // VEX status for visualization
}

export interface AssetEdge {
  source: string; // Asset ID
  target: string; // Asset ID
  label?: string; // Relationship type
  type?: string; // Added to match usage in createAssetGraph
}

export type DataSensitivity = 'Public' | 'Internal' | 'Confidential' | 'Restricted';

export type ImplementationContext = 
  | 'Authentication' 
  | 'Authorization'
  | 'DataEncryption'
  | 'Communications'
  | 'KeyManagement'
  | 'Signatures'
  | 'Other';

export interface CBOMComponent {
  id: string;
  name: string;
  type: string;
  description?: string;
  version?: string;
  assets: CryptographicAsset[];
  subcomponents?: CBOMComponent[];
  
  // Additional metadata
  owner?: string;
  repository?: string;
  tags?: string[];
} 