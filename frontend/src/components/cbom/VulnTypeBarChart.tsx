import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { CBOMInventory, VulnerabilityType } from '../../types/cbom';

// Semantic color palette with rich descriptions
const VULN_COLORS: Record<VulnerabilityType | 'Unknown', { 
  main: string,          // Main color
  gradient: string,      // Gradient end color
  description: string,   // Description of what this vulnerability type means
  impact: string         // Impact on cryptographic security
}> = {
  // Critical vulnerabilities (red family)
  'Shors': { 
    main: '#ef4444', 
    gradient: '#b91c1c', 
    description: 'Vulnerability to Shor\'s algorithm', 
    impact: 'Can break RSA, DSA, ECC, and other public key cryptosystems. Critical priority for quantum security.'
  },
  
  // High vulnerabilities (orange family)
  'Grovers': { 
    main: '#f97316', 
    gradient: '#c2410c', 
    description: 'Vulnerability to Grover\'s algorithm', 
    impact: 'Reduces security of symmetric ciphers to half their key size. Higher priority for large-scale systems.'
  },
  
  // Safe implementations (green family)
  'Quantum-Resistant': { 
    main: '#10b981', 
    gradient: '#059669', 
    description: 'Post-quantum cryptography implementation', 
    impact: 'Resistant to known quantum attacks. Represents secure implementations meeting quantum security standards.'
  },
  
  // Unknown (gray)
  'Unknown': { 
    main: '#6b7280', 
    gradient: '#4b5563', 
    description: 'Vulnerability status undetermined', 
    impact: 'Requires manual assessment to determine quantum vulnerability.'
  }
};

interface VulnTypeBarChartProps {
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

// Custom tooltip that shows detailed information
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { type, count } = payload[0].payload;
    return (
      <div className="bg-gray-800 p-3 rounded shadow-md max-w-xs">
        <p className="font-medium text-white text-sm">{type}</p>
        <p className="text-gray-300 text-xs mb-1">{getVulnTypeDescription(type)}</p>
        <p className="text-gray-400 text-xs mb-2">{getVulnTypeImpact(type)}</p>
        <p className="text-blue-300 text-xs font-medium">{count} Assets Affected</p>
      </div>
    );
  }
  
  return null;
};

// Helper function to provide descriptions for vulnerability types
const getVulnTypeDescription = (vulnType: string): string => {
  return VULN_COLORS[vulnType as VulnerabilityType | 'Unknown']?.description || 'No description available.';
};

const getVulnTypeImpact = (vulnType: string): string => {
  return VULN_COLORS[vulnType as VulnerabilityType | 'Unknown']?.impact || 'Impact unknown.';
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

const VulnTypeBarChart: React.FC<VulnTypeBarChartProps> = ({ cbomData }) => {
  // Aggregate vulnerability type counts from all assets
  const vulnSummary: Record<string, number> = {};
  let total = 0;

  cbomData.components?.forEach(component => {
    component.assets?.forEach(asset => {
      const vulnType = asset.vulnerability_type || 'Unknown';
      vulnSummary[vulnType] = (vulnSummary[vulnType] || 0) + 1;
      total++;
    });
  });

  // Sort data from highest to lowest count for better visualization
  const data = Object.entries(vulnSummary)
    .map(([type, count]) => ({
      type,
      count,
      total, // Add total for percentage calculations in tooltip
      color: VULN_COLORS[type as VulnerabilityType]?.main || VULN_COLORS.Unknown.main,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  return (
    <div className="h-full flex flex-col" aria-label="Vulnerability Type Breakdown Chart">
      <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-200">Vulnerability Type Distribution</h3>
      
      {/* Brief explanation of vulnerability types */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        This chart shows the distribution of quantum vulnerability types in your cryptographic assets. 
        Red indicates critical vulnerabilities, orange shows moderate vulnerabilities, and green represents quantum-resistant implementations.
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
                const vulnType = entry.type;
                const knownType = Object.keys(VULN_COLORS).includes(vulnType);
                
                if (knownType) {
                  // Use predefined colors for known types
                  const { main, gradient } = VULN_COLORS[vulnType as VulnerabilityType | 'Unknown'];
                  return (
                    <linearGradient key={`vuln-gradient-${vulnType}`} id={`vuln-gradient-${vulnType}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={main} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={gradient} stopOpacity={1} />
                    </linearGradient>
                  );
                } else {
                  // Generate consistent color based on type name for unknown types
                  const colorHash = generateColorFromString(vulnType);
                  const darkerColor = darkenColor(colorHash, 20); // 20% darker
                  
                  return (
                    <linearGradient key={`vuln-gradient-${vulnType}`} id={`vuln-gradient-${vulnType}`} x1="0" y1="0" x2="1" y2="0">
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
                const vulnType = entry.type;
                
                return (
                  <Cell 
                    key={`cell-${entry.type}`} 
                    fill={`url(#vuln-gradient-${vulnType})`}
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

      {/* Vulnerability Type Legend with descriptions */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        <h4 className="col-span-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vulnerability Guide:</h4>
        {Object.entries(VULN_COLORS)
          .filter(([type]) => type !== 'Unknown') // Filter out Unknown for cleaner display
          .map(([type, { main, description, impact }]) => (
            <div key={type} className="flex items-start mb-2">
              <span className="inline-block w-3 h-3 mt-1 mr-2 rounded-sm flex-shrink-0" style={{ backgroundColor: main }}></span>
              <div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{type}:</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{description}</span>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{impact}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default VulnTypeBarChart;
