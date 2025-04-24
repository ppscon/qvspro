import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CBOMInventory, RiskLevel } from '../../types/cbom';

// Enhanced color palette with gradients and visually distinct colors
const RISK_COLORS: Record<RiskLevel, { 
  main: string,          // Main color
  gradient: string,      // Gradient end color
  description: string    // Description of what this risk level means
}> = {
  Critical: { 
    main: '#ef4444', 
    gradient: '#b91c1c',
    description: 'Severe vulnerability to quantum attacks requiring immediate remediation'
  },
  High: { 
    main: '#f97316', 
    gradient: '#c2410c',
    description: 'Significant vulnerability with high potential for exploitation'
  },
  Medium: { 
    main: '#eab308', 
    gradient: '#a16207',
    description: 'Moderate vulnerability requiring planned mitigation strategy'
  },
  Low: { 
    main: '#3b82f6', 
    gradient: '#2563eb',
    description: 'Minor vulnerability with limited impact on security posture'
  },
  None: { 
    main: '#10b981', 
    gradient: '#059669',
    description: 'No known vulnerabilities to quantum attacks'
  },
  Unknown: { 
    main: '#6b7280', 
    gradient: '#4b5563',
    description: 'Risk level has not been determined and requires assessment'
  },
};

interface RiskPieChartProps {
  cbomData: CBOMInventory;
}

// Custom label renderer for a cleaner, more readable label outside the pie
const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  
  // Calculate the position for the label, placing it within the slice for larger ones
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
  // Only show labels for slices that are large enough (> 5%)
  if (percent < 0.05) return null;
  
  return (
    <text 
      x={x} 
      y={y} 
      fill="white"
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
      style={{ textShadow: '0px 0px 3px rgba(0,0,0,0.7)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom tooltip that shows detailed information
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const riskLevel = data.name as RiskLevel;
    const percentage = ((data.value / data.total) * 100).toFixed(1);
    return (
      <div className="bg-gray-800 p-3 rounded shadow-md max-w-xs">
        <p className="font-medium text-white text-sm">{riskLevel} Risk</p>
        <p className="text-gray-300 text-xs mb-1">{RISK_COLORS[riskLevel].description}</p>
        <p className="text-blue-300 text-xs font-medium mt-2">{data.value} Assets ({percentage}%)</p>
      </div>
    );
  }
  
  return null;
};

const RiskPieChart: React.FC<RiskPieChartProps> = ({ cbomData }) => {
  // Process the data and calculate totals
  const total = Object.values(cbomData.risk_summary || {}).reduce((sum, count) => sum + count, 0);
  
  // Ensure we have data to render
  const hasData = total > 0;
  
  // Create pie chart data
  const data = Object.entries(cbomData.risk_summary || {})
    .filter(([_, count]) => count > 0)
    .map(([level, count]) => {
      // Format the risk level to match our RISK_COLORS keys (capitalize first letter)
      const formattedLevel = level.charAt(0).toUpperCase() + level.slice(1) as RiskLevel;
      return {
        name: formattedLevel, // Use the formatted level as the name
        originalName: level, // Keep the original for reference
        value: count,
        total: total, // Pass total so we can calculate percentages in tooltip
      };
    });
    
  // Handle empty data case
  if (!hasData || data.length === 0) {
    return (
      <div className="h-full flex flex-col" aria-label="Risk Level Breakdown Chart">
        <h3 className="text-md font-semibold mb-3 text-gray-200">Risk Level Distribution</h3>
        <div className="flex-1 flex items-center justify-center bg-gray-700/50 rounded-lg p-8">
          <p className="text-gray-400 text-center">No risk data available. Run a scan to view risk distribution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" aria-label="Risk Level Breakdown Chart">
      <h3 className="text-md font-semibold mb-3 text-gray-200">Risk Level Distribution</h3>
      
      {/* Brief explanation of risk levels */}
      <p className="text-xs text-gray-400 mb-3">
        This chart shows the distribution of quantum risk levels across your cryptographic assets.
        Each segment represents assets with the same risk classification, from Critical (highest risk) to None (quantum-safe).
      </p>

      {/* Fixed-height container to ensure consistent rendering */}
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
            <defs>
              {/* Add a fallback gradient for Unknown risk level */}
              <linearGradient id="gradient-Unknown-fallback" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={RISK_COLORS['Unknown'].main} stopOpacity={0.8} />
                <stop offset="100%" stopColor={RISK_COLORS['Unknown'].gradient} stopOpacity={1} />
              </linearGradient>
              
              {data.map((entry, index) => {
                const riskLevel = entry.name as RiskLevel;
                // Safe access with fallback to Unknown if the risk level isn't found
                const { main, gradient } = RISK_COLORS[riskLevel] || RISK_COLORS['Unknown'];
                
                return (
                  <linearGradient key={`gradient-${index}`} id={`gradient-${riskLevel}-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={main} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={gradient} stopOpacity={1} />
                  </linearGradient>
                );
              })}
            </defs>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              innerRadius={70}
              paddingAngle={1}
              label={renderCustomLabel}
              labelLine={false}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => {
                const riskLevel = entry.name as RiskLevel;
                // Safe access with fallback to Unknown
                const fillColor = RISK_COLORS[riskLevel] ? `url(#gradient-${riskLevel}-${index})` : `url(#gradient-Unknown-fallback)`;
                
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={fillColor} 
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={1}
                  />
                );
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Level Legend with descriptions */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pb-2">
        <h4 className="col-span-full text-sm font-medium text-gray-300 mb-1">Risk Level Guide:</h4>
        {Object.entries(RISK_COLORS)
          .filter(([level]) => data.some(item => item.name === level || level === 'Unknown')) // Only show levels that appear in the data
          .map(([level, { main, description }]) => (
            <div key={level} className="flex items-start">
              <span className="inline-block w-3 h-3 mt-1 mr-2 rounded-sm flex-shrink-0" style={{ backgroundColor: main }}></span>
              <div>
                <span className="text-xs font-medium text-gray-300">{level}:</span>
                <span className="text-xs text-gray-400 ml-1">{description}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RiskPieChart;
