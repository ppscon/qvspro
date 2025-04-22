import React, { useState } from 'react';
import { FiShield, FiAlertTriangle, FiChevronDown, FiChevronUp, FiLock, FiCheck, FiX } from 'react-icons/fi';

interface CertificateChainVisualizerProps {
  certificateData: any;
  darkMode: boolean;
}

const CertificateChainVisualizer: React.FC<CertificateChainVisualizerProps> = ({ certificateData, darkMode }) => {
  const [expandedCerts, setExpandedCerts] = useState<string[]>([]);

  // Extract certificate chain from provided data
  const leafCertificate = certificateData?.details?.certificate?.leaf_certificate || null;
  const intermediates = certificateData?.details?.certificate?.chain || [];
  
  const allCertificates = leafCertificate ? [leafCertificate, ...intermediates] : intermediates;
  
  // No certificate data available
  if (!leafCertificate && intermediates.length === 0) {
    return (
      <div className={`p-4 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
        <div className="flex items-center justify-center h-16">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No certificate chain data available
          </p>
        </div>
      </div>
    );
  }

  // Toggle certificate details
  const toggleCertificate = (certId: string) => {
    if (expandedCerts.includes(certId)) {
      setExpandedCerts(expandedCerts.filter(id => id !== certId));
    } else {
      setExpandedCerts([...expandedCerts, certId]);
    }
  };

  // Helper to determine if a certificate is quantum vulnerable
  const isCertificateVulnerable = (cert: any) => {
    if (!cert || !cert.public_key) return false;
    return cert.public_key.quantum_vulnerable || false;
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr || 'Unknown';
    }
  };

  // Certificate validity status
  const isCertificateValid = (cert: any) => {
    if (!cert) return false;
    
    try {
      const now = new Date();
      const notBefore = cert.not_valid_before ? new Date(cert.not_valid_before) : null;
      const notAfter = cert.not_valid_after ? new Date(cert.not_valid_after) : null;
      
      if (!notBefore || !notAfter) return false;
      
      return now >= notBefore && now <= notAfter;
    } catch (e) {
      return false;
    }
  };

  // Render a certificate node
  const renderCertificate = (cert: any, index: number, isLast: boolean) => {
    if (!cert) return null;
    
    const certId = cert.serial_number || `cert-${index}`;
    const isExpanded = expandedCerts.includes(certId);
    const isVulnerable = isCertificateVulnerable(cert);
    const isValid = isCertificateValid(cert);
    
    const certType = index === 0 
      ? 'Leaf Certificate' 
      : isLast 
        ? 'Root Certificate' 
        : 'Intermediate Certificate';
    
    return (
      <div key={certId} className="mb-2 last:mb-0">
        <div 
          className={`
            p-3 rounded-lg border cursor-pointer
            ${darkMode 
              ? isVulnerable 
                ? 'bg-red-900/20 border-red-800' 
                : 'bg-gray-750 border-gray-700'
              : isVulnerable 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gray-50 border-gray-200'
            }
          `}
          onClick={() => toggleCertificate(certId)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div 
                className={`p-1.5 rounded-full ${
                  isVulnerable 
                    ? 'bg-red-100 dark:bg-red-900' 
                    : 'bg-green-100 dark:bg-green-900'
                }`}
              >
                <FiShield 
                  size={16} 
                  className={isVulnerable 
                    ? 'text-red-500 dark:text-red-400' 
                    : 'text-green-500 dark:text-green-400'
                  } 
                />
              </div>
              <div>
                <div className="flex items-center">
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cert.subject?.commonName || 'Unknown Certificate'}
                  </span>
                  {isVulnerable && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs font-medium rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                      Quantum Vulnerable
                    </span>
                  )}
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {certType}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span 
                className={`flex items-center px-1.5 py-0.5 rounded text-xs ${
                  isValid 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}
              >
                {isValid 
                  ? <><FiCheck size={12} className="mr-1" /> Valid</> 
                  : <><FiX size={12} className="mr-1" /> Invalid</>
                }
              </span>
              {isExpanded 
                ? <FiChevronUp className={darkMode ? 'text-gray-400' : 'text-gray-500'} /> 
                : <FiChevronDown className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              }
            </div>
          </div>
        </div>
        
        {/* Certificate details when expanded */}
        {isExpanded && (
          <div 
            className={`mt-1 mb-3 p-3 rounded-lg border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Subject</h4>
                <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p><span className="font-medium">Common Name:</span> {cert.subject?.commonName || 'N/A'}</p>
                  <p><span className="font-medium">Organization:</span> {cert.subject?.organization || 'N/A'}</p>
                  <p><span className="font-medium">Organizational Unit:</span> {cert.subject?.organizationalUnit || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h4 className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Issuer</h4>
                <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p><span className="font-medium">Common Name:</span> {cert.issuer?.commonName || 'N/A'}</p>
                  <p><span className="font-medium">Organization:</span> {cert.issuer?.organization || 'N/A'}</p>
                  <p><span className="font-medium">Organizational Unit:</span> {cert.issuer?.organizationalUnit || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h4 className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Validity</h4>
                <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p><span className="font-medium">Not Before:</span> {formatDate(cert.not_valid_before)}</p>
                  <p><span className="font-medium">Not After:</span> {formatDate(cert.not_valid_after)}</p>
                </div>
              </div>
              
              <div>
                <h4 className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Details</h4>
                <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p><span className="font-medium">Serial Number:</span> {cert.serial_number || 'N/A'}</p>
                  <p><span className="font-medium">Version:</span> {cert.version || 'N/A'}</p>
                  <p><span className="font-medium">Signature Algorithm:</span> {cert.signature_algorithm || 'N/A'}</p>
                </div>
              </div>
              
              <div className="col-span-2">
                <h4 className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Public Key</h4>
                <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p><span className="font-medium">Algorithm:</span> {cert.public_key?.algorithm || 'N/A'}</p>
                  <p><span className="font-medium">Key Size:</span> {cert.public_key?.key_size ? `${cert.public_key.key_size} bits` : 'N/A'}</p>
                  {cert.public_key?.curve && (
                    <p><span className="font-medium">Curve:</span> {cert.public_key.curve}</p>
                  )}
                </div>
                
                {/* Quantum vulnerability warning */}
                {isVulnerable && (
                  <div className={`mt-2 p-2 rounded-md ${
                    darkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-start">
                      <FiAlertTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" size={14} />
                      <div>
                        <p className={`text-xs font-medium ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                          Quantum Vulnerability: {cert.public_key?.vulnerability_type || "Shor's Algorithm"}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                          {cert.public_key?.recommendation || 'Replace with quantum-resistant algorithm'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Connection line to next certificate */}
        {!isLast && (
          <div className="flex justify-center my-2">
            <div className="h-6 border-l-2 border-dashed border-gray-300 dark:border-gray-600"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`p-4 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Certificate Chain</h3>
        <div className="flex items-center">
          <div className={`p-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <FiLock size={14} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
          </div>
        </div>
      </div>
      
      <div className="mb-2">
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          The certificate chain establishes trust from your connection to a trusted root certificate authority.
          Each certificate in the chain is signed by the certificate above it.
        </p>
      </div>
      
      <div className="mt-4">
        {allCertificates.map((cert: any, index: number) => 
          renderCertificate(cert, index, index === allCertificates.length - 1)
        )}
      </div>
      
      {/* Summary of quantum vulnerabilities */}
      <div className={`mt-4 p-3 rounded-lg ${
        allCertificates.some(isCertificateVulnerable)
          ? darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
          : darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
      }`}>
        <div className="flex items-start">
          {allCertificates.some(isCertificateVulnerable) ? (
            <>
              <FiAlertTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" size={16} />
              <div>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  Quantum Vulnerable Chain
                </h4>
                <p className={`text-xs mt-1 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  This certificate chain contains one or more certificates that use quantum-vulnerable cryptography.
                  Consider upgrading to post-quantum cryptography for future security.
                </p>
              </div>
            </>
          ) : (
            <>
              <FiCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" size={16} />
              <div>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                  Quantum Safety Assessment
                </h4>
                <p className={`text-xs mt-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                  No quantum vulnerabilities detected in this certificate chain.
                  Continue monitoring for changes to cryptographic standards.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateChainVisualizer; 