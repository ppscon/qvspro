import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { CBOMInventory } from '../../types/cbom';

// Semantic color palette with consistent meanings
const ASSET_COLORS: Record<string, { 
  main: string,          // Main color
  gradient: string,      // Gradient end color
  description: string    // Description of what this asset type represents
}> = {
  // Blue family for encryption/key-based assets
  'Key': { 
    main: '#3b82f6', 
    gradient: '#1d4ed8', 
    description: 'Cryptographic keys used for encryption, authentication, or signing operations.' 
  },
  'Symmetric Key': { 
    main: '#60a5fa', 
    gradient: '#3b82f6', 
    description: 'Keys where the same key is used for both encryption and decryption.' 
  },
  'Asymmetric Key': { 
    main: '#2563eb', 
    gradient: '#1e40af', 
    description: 'Public/private key pairs where different keys are used for encryption and decryption.' 
  },

  // Purple family for verification/identity 
  'Certificate': { 
    main: '#a78bfa', 
    gradient: '#8b5cf6', 
    description: 'Digital certificates used for identity verification or secure connections.' 
  },
  'Signature': { 
    main: '#8b5cf6', 
    gradient: '#7c3aed', 
    description: 'Cryptographic signatures used to verify the authenticity of data.' 
  },

  // Green for security protocols
  'Protocol': { 
    main: '#10b981', 
    gradient: '#059669', 
    description: 'Secure communication protocols implemented in the application.' 
  },
  
  // Orange/yellow for hashing
  'Hash': { 
    main: '#f97316', 
    gradient: '#ea580c', 
    description: 'Hash algorithms used for data integrity, password storage, or verification.' 
  },
  'MAC': { 
    main: '#fb923c', 
    gradient: '#f97316', 
    description: 'Message Authentication Codes for data integrity and authenticity.' 
  },

  // Pink for tokens
  'Token': { 
    main: '#f472b6', 
    gradient: '#ec4899', 
    description: 'Security tokens used for authentication or authorization purposes.' 
  },
  
  // Gray for unknown/other
  'Unknown': { 
    main: '#6b7280', 
    gradient: '#4b5563', 
    description: 'Asset type could not be determined automatically. May require manual review.' 
  }
};

interface AssetTypeBarChartProps {
  cbomData: CBOMInventory;
}

// Generate a consistent color from a string
const generateColorFromString = (str: string): string => {
  // Simple hash function to get a number from a string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to RGB values that are vibrant (avoid dark/dull colors)
  const r = 55 + (Math.abs(hash) % 200); // Range 55-255
  const g = 55 + (Math.abs(hash >> 8) % 200); // Range 55-255
  const b = 55 + (Math.abs(hash >> 16) % 200); // Range 55-255
  
  return `rgb(${r}, ${g}, ${b})`;
};

// Darken a color by a percentage
const darkenColor = (color: string, percent: number): string => {
  // Parse the RGB color
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!rgbMatch) return color;
  
  const r = parseInt(rgbMatch[1], 10);
  const g = parseInt(rgbMatch[2], 10);
  const b = parseInt(rgbMatch[3], 10);
  
  // Darken by reducing each component
  const darkenFactor = 1 - percent / 100;
  const newR = Math.floor(r * darkenFactor);
  const newG = Math.floor(g * darkenFactor);
  const newB = Math.floor(b * darkenFactor);
  
  return `rgb(${newR}, ${newG}, ${newB})`;
};

// Custom tooltip with percentages and descriptions
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const count = payload[0].value;
    const total = payload[0].payload.total;
    const percentage = ((count / total) * 100).toFixed(1);
    
    return (
      <div className="bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-gray-700">
        <p className="text-sm font-bold mb-1 text-white">{label}</p>
        <p className="text-xs text-gray-300">{count} assets ({percentage}%)</p>
        <p className="text-xs text-gray-400 mt-1">{getAssetTypeDescription(label)}</p>
      </div>
    );
  }
  return null;
};

// Helper function to provide descriptions for asset types
const getAssetTypeDescription = (assetType: string): string => {
  return ASSET_COLORS[assetType]?.description || 'No description available.';
};

// Custom legend for better visual hierarchy
const CustomLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <ul className="flex flex-wrap justify-center gap-4 pt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`legend-${index}`} className="flex items-center">
          <span 
            className="inline-block w-3 h-3 mr-2 rounded-sm" 
            style={{ 
              background: `linear-gradient(135deg, ${entry.color} 0%, ${entry.color} 100%)`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          />
          <span className="text-xs text-gray-400">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

// Custom bar labels for count display
const renderCustomBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  
  if (width < 40) return null; // Don't render labels for very small bars
  
  return (
    <text 
      x={x + width / 2} 
      y={y + height / 2} 
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-xs font-medium"
    >
      {value}
    </text>
  );
};

const AssetTypeBarChart: React.FC<AssetTypeBarChartProps> = ({ cbomData }) => {
  // Aggregate asset type counts from all components
  const assetTypeSummary: Record<string, number> = {};
  let total = 0;

  cbomData.components?.forEach(component => {
    component.assets?.forEach(asset => {
      const type = asset.type || 'Unknown';
      assetTypeSummary[type] = (assetTypeSummary[type] || 0) + 1;
      total++;
    });
  });

  // Sort data from highest to lowest count for better visualization
  const data = Object.entries(assetTypeSummary)
    .map(([type, count]) => ({
      type,
      count,
      total,
      color: ASSET_COLORS[type]?.main || ASSET_COLORS.Unknown.main,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="h-full flex flex-col" aria-label="Asset Type Breakdown Chart">
      <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-200">Asset Type Distribution</h3>
      
      {/* Brief explanation of asset types */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        This chart shows the distribution of different cryptographic asset types in your codebase. 
        Each color family represents a category of assets with similar security characteristics.
      </p>

      {/* Chart container */}
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer>
          <BarChart 
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <defs>
              {data.map(entry => {
                const assetType = entry.type;
                const knownType = Object.keys(ASSET_COLORS).includes(assetType);
                
                if (knownType) {
                  // Use predefined colors for known types
                  const { main, gradient } = ASSET_COLORS[assetType];
                  return (
                    <linearGradient key={`asset-gradient-${assetType}`} id={`asset-gradient-${assetType}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={main} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={gradient} stopOpacity={1} />
                    </linearGradient>
                  );
                } else {
                  // Generate consistent color based on type name for unknown types
                  const colorHash = generateColorFromString(assetType);
                  const darkerColor = darkenColor(colorHash, 20); // 20% darker
                  
                  return (
                    <linearGradient key={`asset-gradient-${assetType}`} id={`asset-gradient-${assetType}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={colorHash} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={darkerColor} stopOpacity={1} />
                    </linearGradient>
                  );
                }
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis 
              type="number"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={{ stroke: '#4b5563' }}
              axisLine={{ stroke: '#4b5563' }}
              domain={[0, 'dataMax + 2']}
            />
            <YAxis 
              type="category"
              dataKey="type"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={{ stroke: '#4b5563' }}
              axisLine={{ stroke: '#4b5563' }}
              width={95}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Legend content={<CustomLegend />} />
            <Bar 
              dataKey="count"
              name="Assets"
              radius={[0, 4, 4, 0]}
              barSize={32}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry) => {
                const assetType = entry.type;
                
                return (
                  <Cell 
                    key={`cell-${entry.type}`}
                    fill={`url(#asset-gradient-${assetType})`}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={1}
                  />
                );
              })}
              <LabelList dataKey="count" content={renderCustomBarLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Asset Type Legend with descriptions */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        <h4 className="col-span-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Type Guide:</h4>
        {Object.entries(ASSET_COLORS)
          .filter(([type]) => type !== 'Unknown') // Filter out Unknown for cleaner display
          .map(([type, { main, description }]) => (
            <div key={type} className="flex items-start">
              <span className="inline-block w-3 h-3 mt-1 mr-2 rounded-sm flex-shrink-0" style={{ backgroundColor: main }}></span>
              <div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{type}:</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{description}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AssetTypeBarChart;
