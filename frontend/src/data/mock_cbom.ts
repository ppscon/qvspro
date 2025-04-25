import { CBOMInventory, AlgorithmType, RiskLevel, VulnerabilityType, AssetNode, AssetEdge, ImplementationType } from '../types/cbom';
import { v4 as uuidv4 } from 'uuid';

export const mockCBOMData: CBOMInventory = {
  version: "1.0.0",
  generated_at: new Date().toISOString(),
  name: "QVS-Pro Demo Project",
  description: "Demo CBOM for development purposes",
  total_assets: 15,
  id: "mock-cbom-1",
  components: [
    {
      id: "comp-1",
      name: "Authentication Module",
      description: "Handles user authentication and session management",
      version: "2.0.5",
      type: "Core",
      path: "/src/auth",
      owner: "Security Team",
      assets: [
        {
          id: "asset-1",
          name: "JWT Signing",
          type: "PublicKey",
          implementation_type: "Library" as ImplementationType,
          description: "RSA signature for JWT tokens",
          version: "3.1.0",
          risk_level: "High" as RiskLevel,
          vulnerability_type: "Shors" as VulnerabilityType,
          key_size: 2048,
          component_id: "comp-1",
          file_path: "/src/auth/jwt.js",
          line_number: 42,
          dependencies: []
        },
        {
          id: "asset-2",
          name: "Password Hashing",
          type: "Hash",
          implementation_type: "Library" as ImplementationType,
          description: "bcrypt for password storage",
          version: "4.0.1",
          risk_level: "Low" as RiskLevel,
          vulnerability_type: "Grovers" as VulnerabilityType,
          component_id: "comp-1",
          file_path: "/src/auth/password.js",
          line_number: 23,
          dependencies: []
        },
        {
          id: "asset-3",
          name: "Session Encryption",
          type: "SymmetricKey",
          implementation_type: "Library" as ImplementationType,
          description: "AES-256 for session data",
          version: "1.2.0",
          risk_level: "Medium" as RiskLevel,
          vulnerability_type: "Grovers" as VulnerabilityType,
          key_size: 256,
          component_id: "comp-1",
          file_path: "/src/auth/session.js",
          line_number: 78,
          dependencies: ["asset-2"]
        }
      ]
    },
    {
      id: "comp-2",
      name: "Data Storage Layer",
      description: "Encryption for data at rest",
      version: "1.5.0",
      type: "Core",
      path: "/src/storage",
      owner: "Backend Team",
      assets: [
        {
          id: "asset-4",
          name: "Database Encryption",
          type: "SymmetricKey",
          implementation_type: "Library" as ImplementationType,
          description: "AES-128 for database fields",
          version: "2.0.0",
          risk_level: "High" as RiskLevel,
          vulnerability_type: "Grovers" as VulnerabilityType,
          key_size: 128,
          component_id: "comp-2",
          file_path: "/src/storage/encrypt.js",
          line_number: 15,
          dependencies: []
        },
        {
          id: "asset-5",
          name: "Backup Encryption",
          type: "SymmetricKey",
          implementation_type: "Service" as ImplementationType,
          description: "AWS KMS with AES-256",
          version: "AWS KMS",
          risk_level: "Medium" as RiskLevel,
          vulnerability_type: "Grovers" as VulnerabilityType,
          key_size: 256,
          component_id: "comp-2",
          file_path: "/src/storage/backup.js",
          line_number: 92,
          dependencies: []
        }
      ]
    },
    {
      id: "comp-3",
      name: "API Communication",
      description: "Secure API endpoints and data transmission",
      version: "3.2.1",
      type: "Core",
      path: "/src/api",
      owner: "API Team",
      assets: [
        {
          id: "asset-6",
          name: "TLS Connection",
          type: "PublicKey",
          implementation_type: "Service" as ImplementationType,
          description: "TLS 1.3 with ECDSA",
          version: "1.3",
          risk_level: "High" as RiskLevel,
          vulnerability_type: "Shors" as VulnerabilityType,
          key_size: 256,
          component_id: "comp-3",
          file_path: "/src/api/config.js",
          line_number: 33,
          dependencies: []
        },
        {
          id: "asset-7",
          name: "API Request Signing",
          type: "PublicKey",
          implementation_type: "Custom" as ImplementationType,
          description: "ECDSA P-256 for API requests",
          version: "1.0.0",
          risk_level: "High" as RiskLevel,
          vulnerability_type: "Shors" as VulnerabilityType,
          key_size: 256,
          component_id: "comp-3",
          file_path: "/src/api/auth.js",
          line_number: 120,
          dependencies: ["asset-6"]
        }
      ]
    },
    {
      id: "comp-4",
      name: "User Management",
      description: "User account operations and management",
      version: "2.1.0",
      type: "Feature",
      path: "/src/users",
      owner: "Identity Team",
      assets: [
        {
          id: "asset-8",
          name: "Password Reset Tokens",
          type: "Hash",
          implementation_type: "Custom" as ImplementationType,
          description: "SHA-256 for reset tokens",
          version: "N/A",
          risk_level: "Medium" as RiskLevel,
          vulnerability_type: "Grovers" as VulnerabilityType,
          component_id: "comp-4",
          file_path: "/src/users/reset.js",
          line_number: 45,
          dependencies: []
        },
        {
          id: "asset-9",
          name: "Email Verification",
          type: "Hash",
          implementation_type: "Library" as ImplementationType,
          description: "HMAC-SHA256 for email verification",
          version: "2.0.0",
          risk_level: "Medium" as RiskLevel,
          vulnerability_type: "Grovers" as VulnerabilityType,
          component_id: "comp-4",
          file_path: "/src/users/verify.js",
          line_number: 67,
          dependencies: []
        }
      ]
    },
    {
      id: "comp-5",
      name: "Quantum-Safe Module",
      description: "Post-quantum cryptography implementation",
      version: "0.9.0",
      type: "Experimental",
      path: "/src/quantum",
      owner: "Research Team",
      assets: [
        {
          id: "asset-10",
          name: "NIST PQC Implementation",
          type: "PostQuantum",
          implementation_type: "Library" as ImplementationType,
          description: "Dilithium for signatures",
          version: "NIST Round 3",
          risk_level: "None" as RiskLevel,
          vulnerability_type: "QuantumResistant" as VulnerabilityType,
          component_id: "comp-5",
          file_path: "/src/quantum/sign.js",
          line_number: 28,
          dependencies: []
        },
        {
          id: "asset-11",
          name: "Quantum Key Distribution",
          type: "PostQuantum",
          implementation_type: "Custom" as ImplementationType,
          description: "Experimental QKD simulation",
          version: "0.5.0",
          risk_level: "None" as RiskLevel,
          vulnerability_type: "QuantumResistant" as VulnerabilityType,
          component_id: "comp-5",
          file_path: "/src/quantum/qkd.js",
          line_number: 103,
          dependencies: []
        },
        {
          id: "asset-12",
          name: "Kyber Key Exchange",
          type: "PostQuantum",
          implementation_type: "Library" as ImplementationType,
          description: "Kyber-768 for key exchange",
          version: "NIST Round 3",
          risk_level: "None" as RiskLevel,
          vulnerability_type: "QuantumResistant" as VulnerabilityType,
          component_id: "comp-5",
          file_path: "/src/quantum/kyber.js",
          line_number: 55,
          dependencies: []
        }
      ]
    }
  ],
  risk_summary: {
    critical: 0,
    high: 4,
    medium: 5,
    low: 1,
    none: 3,
    unknown: 2
  },
  vulnerability_summary: {
    shors: 3,
    grovers: 5,
    quantum_resistant: 3,
    none: 0,
    unknown: 4
  },
  graph: {
    nodes: [
      { id: "asset-1", label: "JWT Signing", type: "PublicKey", risk_level: "High" as RiskLevel, component_id: "comp-1" },
      { id: "asset-2", label: "Password Hashing", type: "Hash", risk_level: "Low" as RiskLevel, component_id: "comp-1" },
      { id: "asset-3", label: "Session Encryption", type: "SymmetricKey", risk_level: "Medium" as RiskLevel, component_id: "comp-1" },
      { id: "asset-4", label: "Database Encryption", type: "SymmetricKey", risk_level: "High" as RiskLevel, component_id: "comp-2" },
      { id: "asset-5", label: "Backup Encryption", type: "SymmetricKey", risk_level: "Medium" as RiskLevel, component_id: "comp-2" },
      { id: "asset-6", label: "TLS Connection", type: "PublicKey", risk_level: "High" as RiskLevel, component_id: "comp-3" },
      { id: "asset-7", label: "API Request Signing", type: "PublicKey", risk_level: "High" as RiskLevel, component_id: "comp-3" },
      { id: "asset-8", label: "Password Reset Tokens", type: "Hash", risk_level: "Medium" as RiskLevel, component_id: "comp-4" },
      { id: "asset-9", label: "Email Verification", type: "Hash", risk_level: "Medium" as RiskLevel, component_id: "comp-4" },
      { id: "asset-10", label: "NIST PQC Implementation", type: "PostQuantum", risk_level: "None" as RiskLevel, component_id: "comp-5" },
      { id: "asset-11", label: "Quantum Key Distribution", type: "PostQuantum", risk_level: "None" as RiskLevel, component_id: "comp-5" },
      { id: "asset-12", label: "Kyber Key Exchange", type: "PostQuantum", risk_level: "None" as RiskLevel, component_id: "comp-5" }
    ] as AssetNode[],
    edges: [
      { source: "asset-3", target: "asset-2", label: "depends on" },
      { source: "asset-7", target: "asset-6", label: "depends on" }
    ] as AssetEdge[]
  }
};

// Helper function to generate a random CBOM with configurable size
export const generateRandomCBOM = (
  componentCount: number = 5, 
  assetsPerComponent: number = 3
): CBOMInventory => {
  const algorithmTypes: AlgorithmType[] = [
    'SymmetricKey', 'PublicKey', 'Hash', 'MAC', 'RNG', 'KDF', 'PostQuantum', 'Other'
  ];
  
  const riskLevels: RiskLevel[] = [
    'Critical', 'High', 'Medium', 'Low', 'None', 'Unknown'
  ];
  
  const vulnerabilityTypes: VulnerabilityType[] = [
    'Shors', 'Grovers', 'QuantumResistant', 'Unknown'
  ];
  
  const implementationTypes: ImplementationType[] = [
    'Library', 'Custom', 'Hardware', 'Service', 'Unknown'
  ];
  
  const components: any[] = [];
  const riskSummary = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    none: 0,
    unknown: 0
  };
  
  const vulnSummary = {
    shors: 0,
    grovers: 0,
    quantum_resistant: 0,
    none: 0,
    unknown: 0
  };
  
  let totalAssets = 0;
  
  // Generate components with assets
  for (let i = 0; i < componentCount; i++) {
    const componentId = `comp-${i+1}`;
    const assets: any[] = [];
    
    // Generate assets for this component
    for (let j = 0; j < assetsPerComponent; j++) {
      const assetId = `asset-${totalAssets + 1}`;
      totalAssets++;
      
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const vulnType = vulnerabilityTypes[Math.floor(Math.random() * vulnerabilityTypes.length)];
      
      // Update summary counts
      if (riskLevel === 'Critical') riskSummary.critical++;
      else if (riskLevel === 'High') riskSummary.high++;
      else if (riskLevel === 'Medium') riskSummary.medium++;
      else if (riskLevel === 'Low') riskSummary.low++;
      else if (riskLevel === 'None') riskSummary.none++;
      else riskSummary.unknown++;
      
      if (vulnType === 'Shors') vulnSummary.shors++;
      else if (vulnType === 'Grovers') vulnSummary.grovers++;
      else if (vulnType === 'QuantumResistant') vulnSummary.quantum_resistant++;
      else vulnSummary.unknown++;
      
      const asset = {
        id: assetId,
        name: `Asset ${totalAssets}`,
        type: algorithmTypes[Math.floor(Math.random() * algorithmTypes.length)],
        implementation_type: implementationTypes[Math.floor(Math.random() * implementationTypes.length)],
        description: `Mock asset ${totalAssets} description`,
        version: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
        risk_level: riskLevel,
        vulnerability_type: vulnType,
        key_size: [128, 256, 512, 1024, 2048, 3072, 4096][Math.floor(Math.random() * 7)],
        component_id: componentId,
        file_path: `/mock/path/to/file_${totalAssets}.js`,
        line_number: Math.floor(Math.random() * 100) + 1,
        dependencies: []
      };
      
      assets.push(asset);
    }
    
    const component = {
      id: componentId,
      name: `Component ${i+1}`,
      description: `Mock component ${i+1} description`,
      version: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
      type: ['Core', 'Feature', 'Library', 'Service'][Math.floor(Math.random() * 4)],
      path: `/mock/path/to/component_${i+1}`,
      owner: ['Security Team', 'Dev Team', 'Infrastructure Team'][Math.floor(Math.random() * 3)],
      assets: assets
    };
    
    components.push(component);
  }
  
  // Create a simple graph representation
  const nodes: AssetNode[] = [];
  const edges: AssetEdge[] = [];
  
  components.forEach(component => {
    component.assets.forEach((asset: any) => {
      nodes.push({
        id: asset.id,
        label: asset.name,
        type: asset.type,
        risk_level: asset.risk_level,
        component_id: component.id
      });
    });
  });
  
  // Add some random dependencies
  const assetIds = nodes.map(node => node.id);
  for (let i = 0; i < Math.min(totalAssets / 2, 10); i++) {
    const source = assetIds[Math.floor(Math.random() * assetIds.length)];
    const target = assetIds[Math.floor(Math.random() * assetIds.length)];
    
    if (source !== target) {
      edges.push({
        source,
        target,
        label: 'depends on'
      });
      
      // Find the source asset and add the dependency
      for (const component of components) {
        const asset = component.assets.find((a: any) => a.id === source);
        if (asset) {
          if (!asset.dependencies) {
            asset.dependencies = [] as string[];
          }
          asset.dependencies.push(target);
          break;
        }
      }
    }
  }
  
  return {
    version: "1.0.0",
    generated_at: new Date().toISOString(),
    name: "Randomly Generated CBOM",
    description: `Auto-generated CBOM with ${componentCount} components and ${totalAssets} assets`,
    total_assets: totalAssets,
    components,
    risk_summary: riskSummary,
    vulnerability_summary: vulnSummary,
    graph: {
      nodes,
      edges
    }
  };
}; 