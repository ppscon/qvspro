import React, { useMemo } from 'react';
import { VexDocument } from '../../types/vex';
import { CBOMInventory, CryptographicAsset } from '../../types/cbom';

interface VexStatusChartProps {
  cbomData: CBOMInventory;
}

const VexStatusChart: React.FC<VexStatusChartProps> = ({ cbomData }) => {
  // Check if VEX data is available
  const hasVexData = useMemo(() => {
    if (!cbomData || !cbomData.components) return false;
    
    // Check if any assets have VEX status
    return cbomData.components.some(component => 
      component.assets.some(asset => asset.vex_status)
    );
  }, [cbomData]);
  
  // Calculate VEX status counts
  const vexStatusCounts = useMemo(() => {
    if (!cbomData || !cbomData.components) {
      return {
        not_affected: 0,
        affected: 0,
        fixed: 0,
        under_investigation: 0,
        no_vex_data: 0,
        total: 0  // Add total property to ensure consistent shape
      };
    }
    
    let totalAssets = 0;
    const counts = {
      not_affected: 0,
      affected: 0,
      fixed: 0,
      under_investigation: 0,
      no_vex_data: 0
    };
    
    cbomData.components.forEach(component => {
      component.assets.forEach(asset => {
        totalAssets++;
        
        if (asset.vex_status) {
          counts[asset.vex_status as keyof typeof counts]++;
        } else {
          counts.no_vex_data++;
        }
      });
    });
    
    return {
      ...counts,
      total: totalAssets
    };
  }, [cbomData]);
  
  // Color scheme for VEX statuses
  const vexStatusColors: Record<string, string> = {
    not_affected: '#10b981', // green
    affected: '#ef4444',     // red
    fixed: '#3b82f6',        // blue
    under_investigation: '#eab308', // yellow
    no_vex_data: '#6b7280'   // gray
  };
  
  // Calculate the percentages and angles for the pie chart
  const pieChartData = useMemo(() => {
    const total = vexStatusCounts.total || 1; // Avoid division by zero
    
    return [
      {
        status: 'not_affected',
        label: 'Not Affected',
        count: vexStatusCounts.not_affected,
        percentage: Math.round((vexStatusCounts.not_affected / total) * 100),
        color: vexStatusColors.not_affected
      },
      {
        status: 'affected',
        label: 'Affected',
        count: vexStatusCounts.affected,
        percentage: Math.round((vexStatusCounts.affected / total) * 100),
        color: vexStatusColors.affected
      },
      {
        status: 'fixed',
        label: 'Fixed',
        count: vexStatusCounts.fixed,
        percentage: Math.round((vexStatusCounts.fixed / total) * 100),
        color: vexStatusColors.fixed
      },
      {
        status: 'under_investigation',
        label: 'Under Investigation',
        count: vexStatusCounts.under_investigation,
        percentage: Math.round((vexStatusCounts.under_investigation / total) * 100),
        color: vexStatusColors.under_investigation
      },
      {
        status: 'no_vex_data',
        label: 'No VEX Data',
        count: vexStatusCounts.no_vex_data,
        percentage: Math.round((vexStatusCounts.no_vex_data / total) * 100),
        color: vexStatusColors.no_vex_data
      }
    ].filter(item => item.count > 0); // Only show statuses with counts > 0
  }, [vexStatusCounts]);
  
  // SVG dimensions and settings
  const size = 240;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;
  
  // Generate the pie chart
  const pieChart = useMemo(() => {
    let startAngle = 0;
    
    return pieChartData.map((data, index) => {
      const percentage = data.percentage;
      const angle = (percentage / 100) * 360;
      const endAngle = startAngle + angle;
      
      // Calculate path for pie slice
      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      const slice = {
        path: pathData,
        color: data.color,
        startAngle,
        endAngle,
        percentage,
        labelAngle: startAngle + angle / 2,
        status: data.status,
        label: data.label,
        count: data.count
      };
      
      startAngle = endAngle;
      
      return slice;
    });
  }, [pieChartData]);
  
  if (!hasVexData) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-center p-6">
        <h3 className="text-lg font-medium text-gray-100 mb-4">Vulnerability Exploitability</h3>
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-gray-300">No VEX Data Available</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          Vulnerability exploitability context not available for this CBOM.
        </p>
        <div className="mt-4 pt-4 border-t border-gray-700 w-full">
          <button 
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center mx-auto"
            onClick={() => window.open('https://www.cisa.gov/sites/default/files/2023-04/VEX-FAQ-508c.pdf', '_blank')}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Learn about VEX documents
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-medium text-gray-100 mb-4">Vulnerability Exploitability</h3>
      
      <div className="relative" aria-hidden="true">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Pie slices */}
          {pieChart.map((slice, index) => (
            <path
              key={`slice-${index}`}
              d={slice.path}
              fill={slice.color}
              stroke="#1f2937"
              strokeWidth="1"
            />
          ))}
          
          {/* Center circle for donut effect */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.6}
            fill="#1f2937"
          />
          
          {/* Center text showing affected percentage */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize="28px"
            fontWeight="bold"
          >
            {pieChartData.find(data => data.status === 'affected')?.percentage || 0}%
          </text>
          <text
            x={centerX}
            y={centerY + 22}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ef4444"
            fontSize="14px"
            fontWeight="bold"
          >
            AFFECTED
          </text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
        {pieChartData.map((data, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: data.color }}
            ></div>
            <span className="text-sm text-gray-300">
              {data.label} ({data.count}) - {data.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VexStatusChart; 