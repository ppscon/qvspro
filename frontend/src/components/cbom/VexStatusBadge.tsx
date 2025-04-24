import React from 'react';
import { VexStatus } from '../../types/vex';

// Define colors and labels for different VEX statuses
const VEX_STATUS_CONFIG: Record<VexStatus, { color: string, label: string, description: string }> = {
  'not_affected': {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Not Affected',
    description: 'This vulnerability does not affect the component as deployed'
  },
  'affected': {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Affected',
    description: 'This vulnerability affects the component as deployed'
  },
  'fixed': {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Fixed',
    description: 'This vulnerability has been fixed in the component'
  },
  'under_investigation': {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Under Investigation',
    description: 'The impact of this vulnerability is still being investigated'
  }
};

interface VexStatusBadgeProps {
  status: VexStatus;
  showTooltip?: boolean;
  compact?: boolean;
}

const VexStatusBadge: React.FC<VexStatusBadgeProps> = ({ 
  status, 
  showTooltip = true,
  compact = false 
}) => {
  const config = VEX_STATUS_CONFIG[status];
  
  return (
    <div className="relative inline-block">
      <span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
        title={showTooltip ? config.description : undefined}
      >
        {!compact && <span className="mr-1">VEX:</span>}
        {config.label}
      </span>
    </div>
  );
};

export default VexStatusBadge; 