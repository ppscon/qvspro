import React from 'react';
import { VexDocument, VexJustification } from '../../types/vex';
import VexStatusBadge from './VexStatusBadge';

// Justification description mapping
const JUSTIFICATION_DESCRIPTIONS: Record<VexJustification, string> = {
  'component_not_present': 'The component is not included in the product.',
  'vulnerable_code_not_present': 'The vulnerable code is not present in the product.',
  'vulnerable_code_not_in_execute_path': 'The vulnerable code cannot be executed in the deployed configuration.',
  'vulnerable_code_cannot_be_controlled_by_adversary': 'The vulnerable code cannot be controlled by an adversary.',
  'inline_mitigations_already_exist': 'Existing mitigations prevent exploitation of the vulnerability.',
  'not_applicable': 'The vulnerability is not applicable to this product.'
};

interface VexDetailPanelProps {
  vexDocument: VexDocument;
  onClose?: () => void;
}

const VexDetailPanel: React.FC<VexDetailPanelProps> = ({ vexDocument, onClose }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Vulnerability Exploitability Details
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
          <VexStatusBadge status={vexDocument.status} />
        </div>
        
        {vexDocument.status_notes && (
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</span>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded">
              {vexDocument.status_notes}
            </p>
          </div>
        )}
        
        {vexDocument.justification && (
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Justification</span>
            <div className="mt-1 bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                {vexDocument.justification.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {JUSTIFICATION_DESCRIPTIONS[vexDocument.justification]}
              </p>
            </div>
          </div>
        )}
        
        {vexDocument.impact && (
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Impact</span>
            <div className="mt-1 bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="flex items-center">
                <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                  vexDocument.impact === 'critical' ? 'bg-red-600' :
                  vexDocument.impact === 'high' ? 'bg-orange-500' :
                  vexDocument.impact === 'medium' ? 'bg-yellow-500' :
                  vexDocument.impact === 'low' ? 'bg-blue-500' : 'bg-green-500'
                }`}></span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-200 capitalize">
                  {vexDocument.impact}
                </span>
              </div>
              {vexDocument.impact_statement && (
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-2">
                  {vexDocument.impact_statement}
                </p>
              )}
            </div>
          </div>
        )}
        
        {vexDocument.remediation_plan && (
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Remediation Plan</span>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded">
              {vexDocument.remediation_plan}
            </p>
            {vexDocument.remediation_deadline && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Target completion: {new Date(vexDocument.remediation_deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>Created: {new Date(vexDocument.created_at).toLocaleString()}</div>
          <div>Updated: {new Date(vexDocument.updated_at).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default VexDetailPanel; 