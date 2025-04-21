import React, { useState } from 'react';
import { FiArrowRight, FiShield, FiKey, FiLock, FiAlertTriangle, FiInfo } from 'react-icons/fi';

interface TLSHandshakeVisualizerProps {
  handshakeData: any;
  darkMode: boolean;
}

const TLSHandshakeVisualizer: React.FC<TLSHandshakeVisualizerProps> = ({ handshakeData, darkMode }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  // Extract important data from the handshake data
  const tls_version = handshakeData?.details?.tls_version?.name || 'TLS 1.2';
  const cipher_suite = handshakeData?.details?.cipher_suite?.name || 'Unknown Cipher Suite';
  const key_exchange = handshakeData?.details?.key_exchange?.method || 'Unknown Key Exchange';
  const selected_group = handshakeData?.details?.key_exchange?.selected_group?.name || null;
  const certificate_algorithm = handshakeData?.details?.certificate?.leaf_certificate?.public_key?.algorithm || 'Unknown Algorithm';
  
  // Vulnerability flags
  const is_key_exchange_vulnerable = handshakeData?.details?.key_exchange?.selected_group?.quantum_vulnerable || false;
  const is_certificate_vulnerable = handshakeData?.details?.certificate?.leaf_certificate?.public_key?.quantum_vulnerable || false;
  const vulnerabilities = handshakeData?.vulnerabilities || [];

  // TLS handshake steps with explanations
  const handshakeSteps = [
    {
      title: 'Client Hello',
      description: 'Client initiates connection and shares supported cipher suites and extensions',
      quantumImplication: 'Client may offer supported groups (curves) that could be vulnerable to quantum attacks',
      diagram: (
        <div className="flex items-center justify-center my-4">
          <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg">Client</div>
          <FiArrowRight className="mx-4 text-blue-500" size={24} />
          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg">Server</div>
        </div>
      )
    },
    {
      title: 'Server Hello',
      description: 'Server selects cipher suite and sends its choice to the client',
      quantumImplication: 'Server selects the key exchange method and parameters that may be vulnerable',
      selectedItems: [
        { name: 'TLS Version', value: tls_version, vulnerable: false },
        { name: 'Cipher Suite', value: cipher_suite, vulnerable: vulnerabilities.some((v: any) => v.component === 'cipher_suite') }
      ],
      diagram: (
        <div className="flex items-center justify-center my-4">
          <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg">Client</div>
          <FiArrowRight className="mx-4 text-purple-500 rotate-180" size={24} />
          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg">Server</div>
        </div>
      )
    },
    {
      title: 'Server Certificate',
      description: 'Server sends its certificate for authentication',
      quantumImplication: 'Certificate\'s public key may be vulnerable to quantum factoring attacks',
      selectedItems: [
        { 
          name: 'Certificate Algorithm', 
          value: certificate_algorithm, 
          vulnerable: is_certificate_vulnerable 
        }
      ],
      diagram: (
        <div className="flex items-center justify-center my-4">
          <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg">Client</div>
          <div className="flex flex-col items-center mx-4">
            <FiArrowRight className="text-purple-500 rotate-180" size={24} />
            <div className="my-2 p-1 bg-green-100 dark:bg-green-900 rounded">
              <FiShield className="text-green-600 dark:text-green-400" size={20} />
            </div>
          </div>
          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg">Server</div>
        </div>
      )
    },
    {
      title: 'Key Exchange',
      description: 'Exchange of cryptographic parameters to establish a shared secret',
      quantumImplication: 'Quantum computers can break widely used key exchange methods like ECDHE and RSA',
      selectedItems: [
        { 
          name: 'Key Exchange Method', 
          value: key_exchange, 
          vulnerable: is_key_exchange_vulnerable 
        },
        { 
          name: 'Curve/Group', 
          value: selected_group || 'Not specified', 
          vulnerable: is_key_exchange_vulnerable 
        }
      ],
      diagram: (
        <div className="flex items-center justify-center my-4">
          <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg relative">
            Client
            {is_key_exchange_vulnerable && (
              <div className="absolute -top-1 -right-1">
                <FiAlertTriangle className="text-yellow-500" size={16} />
              </div>
            )}
          </div>
          <div className="flex flex-col items-center mx-4">
            <FiArrowRight className="text-blue-500" size={24} />
            <div className="my-2 p-1 bg-yellow-100 dark:bg-yellow-900 rounded">
              <FiKey className={`${is_key_exchange_vulnerable ? 'text-red-500' : 'text-yellow-600 dark:text-yellow-400'}`} size={20} />
            </div>
          </div>
          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg">Server</div>
        </div>
      )
    },
    {
      title: 'Finished',
      description: 'Handshake completion and establishment of encrypted session',
      quantumImplication: 'The session may be vulnerable to future quantum decryption if "harvest now, decrypt later" attacks are used',
      diagram: (
        <div className="flex items-center justify-center my-4">
          <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg">Client</div>
          <div className="flex flex-col items-center mx-4">
            <div className="flex items-center">
              <FiArrowRight className="text-green-500" size={24} />
              <FiLock className="ml-2 text-green-600 dark:text-green-400" size={16} />
            </div>
            <div className="flex items-center mt-2">
              <FiArrowRight className="text-green-500 rotate-180" size={24} />
              <FiLock className="ml-2 text-green-600 dark:text-green-400" size={16} />
            </div>
          </div>
          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg">Server</div>
        </div>
      )
    }
  ];

  const currentStep = handshakeSteps[activeStep];

  // Navigate through handshake steps
  const goToNextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, handshakeSteps.length - 1));
  };

  const goToPrevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Calculate overall quantum safety status
  const isQuantumSafe = !is_key_exchange_vulnerable && !is_certificate_vulnerable && vulnerabilities.length === 0;

  return (
    <div className={`mt-6 p-4 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          TLS Handshake Analysis
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isQuantumSafe 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {isQuantumSafe ? 'Quantum Safe' : 'Quantum Vulnerable'}
          </span>
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            title={showExplanation ? 'Hide explanations' : 'Show explanations'}
          >
            <FiInfo size={16} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex mb-4">
        {handshakeSteps.map((step, index) => (
          <div key={index} className="flex-1">
            <div
              className={`h-1 ${
                index <= activeStep
                  ? 'bg-blue-500'
                  : darkMode
                  ? 'bg-gray-700'
                  : 'bg-gray-200'
              }`}
            ></div>
          </div>
        ))}
      </div>

      {/* Current step */}
      <div className="mb-6">
        <h4 className={`text-md font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {activeStep + 1}. {currentStep.title}
        </h4>
        {showExplanation && (
          <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentStep.description}
          </p>
        )}
      </div>

      {/* Diagram */}
      <div className="mb-6">
        {currentStep.diagram}
      </div>

      {/* Selected parameters */}
      {currentStep.selectedItems && (
        <div className="mb-6">
          <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Parameters Selected
          </h5>
          <div className="grid grid-cols-2 gap-2">
            {currentStep.selectedItems.map((item, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-md ${
                  item.vulnerable 
                    ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800' 
                    : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                  {item.vulnerable && (
                    <FiAlertTriangle className="text-red-500" size={14} />
                  )}
                </div>
                <div className={`text-sm mt-1 ${
                  item.vulnerable 
                    ? 'text-red-800 dark:text-red-300' 
                    : 'text-gray-800 dark:text-gray-300'
                }`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quantum implications */}
      {showExplanation && (
        <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-md">
          <div className="flex items-start">
            <FiAlertTriangle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" size={16} />
            <div>
              <h5 className={`text-sm font-medium mb-1 ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                Quantum Vulnerability
              </h5>
              <p className={`text-xs ${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                {currentStep.quantumImplication}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={goToPrevStep}
          disabled={activeStep === 0}
          className={`px-3 py-1 rounded text-sm ${
            activeStep === 0
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Previous
        </button>
        <button
          onClick={goToNextStep}
          disabled={activeStep === handshakeSteps.length - 1}
          className={`px-3 py-1 rounded text-sm ${
            activeStep === handshakeSteps.length - 1
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TLSHandshakeVisualizer; 