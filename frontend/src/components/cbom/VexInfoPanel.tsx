import React from 'react';

interface VexInfoPanelProps {
  onClose: () => void;
}

const VexInfoPanel: React.FC<VexInfoPanelProps> = ({ onClose }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400">Understanding VEX in the Quantum Context</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="text-gray-200 space-y-4">
          <p className="text-lg">
            <span className="font-semibold text-blue-300">VEX (Vulnerability Exploitability eXchange)</span> provides critical context 
            about vulnerabilities in your cryptographic assets, particularly in relation to quantum computing threats.
          </p>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-blue-300 mb-2">Future-Oriented Quantum Threats</h3>
            <p>
              The quantum threat to current cryptography is <span className="font-bold text-yellow-300">future-oriented</span>, not immediate. 
              Large-scale quantum computers capable of breaking commonly used cryptography do not yet exist. 
              Current vulnerabilities represent potential future risks when quantum computing reaches sufficient scale.
            </p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-blue-300 mb-2">Migration to Quantum-Resistant Algorithms</h3>
            <p>
              The focus is on <span className="font-bold text-green-300">planned migration</span> to quantum-resistant algorithms. 
              This migration is a proactive measure to address future threats, not a reaction to current exploitation.
              Organizations typically have time to implement these migrations as part of their normal update cycles.
            </p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-blue-300 mb-2">VEX and Current Exploitability</h3>
            <p>
              VEX documents address the <span className="font-bold">current operational context</span> of vulnerabilities. 
              They help distinguish between vulnerabilities that:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Require immediate attention due to current threats</li>
              <li>Can be managed through planned migration processes</li>
              <li>Are not applicable to your specific implementation</li>
              <li>Have already been addressed through mitigations</li>
            </ul>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-blue-300 mb-2">Understanding VEX Status Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="bg-gray-700 rounded p-3">
                <h4 className="font-semibold text-red-400">Affected</h4>
                <p className="text-sm mt-1">The vulnerability affects this asset and requires attention according to your organization's security policies.</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <h4 className="font-semibold text-green-400">Not Affected</h4>
                <p className="text-sm mt-1">The vulnerability does not affect this asset due to specific implementation details or configuration.</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <h4 className="font-semibold text-blue-400">Fixed</h4>
                <p className="text-sm mt-1">The vulnerability has been addressed through updates, patches, or configuration changes.</p>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <h4 className="font-semibold text-yellow-400">Under Investigation</h4>
                <p className="text-sm mt-1">The impact of the vulnerability on this asset is currently being analyzed.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <p>
              By providing this context, VEX helps organizations prioritize their quantum migration efforts effectively, 
              focusing resources on the most critical assets while managing others through normal maintenance cycles.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900 px-6 py-4 flex justify-end">
        <button 
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VexInfoPanel; 