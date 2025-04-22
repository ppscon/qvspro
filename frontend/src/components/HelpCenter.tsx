import React, { useState } from 'react';
import { FiX, FiChevronRight, FiChevronDown, FiHelpCircle, FiFileText, FiWifi, FiAlertTriangle, FiCheck, FiCpu, FiActivity } from 'react-icons/fi';

interface HelpCenterProps {
  darkMode: boolean;
  onClose: () => void;
  initialSection?: string;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ darkMode, onClose, initialSection = 'general' }) => {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [expandedFaqs, setExpandedFaqs] = useState<string[]>([]);

  const toggleFaq = (id: string) => {
    if (expandedFaqs.includes(id)) {
      setExpandedFaqs(expandedFaqs.filter(item => item !== id));
    } else {
      setExpandedFaqs([...expandedFaqs, id]);
    }
  };

  const helpTopics = [
    {
      id: 'general',
      title: 'General',
      description: 'Overview and general information about QVS-Pro',
      icon: <FiHelpCircle className="text-blue-500" size={24} />,
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">About QVS-Pro</h3>
          <p className="mb-4">
            QVS-Pro (Quantum Vulnerability Scanner Professional) is a comprehensive security tool designed to help developers and security professionals identify potential vulnerabilities in their codebase that could be exploited by quantum computers.
          </p>
          
          <h4 className="text-lg font-medium mb-2">Key Features</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>File Scanner: Analyze your code for cryptographic vulnerabilities</li>
            <li>Network Traffic Analyzer: Monitor and identify vulnerable network communications</li>
            <li>Risk Assessment Dashboard: Visualize and prioritize identified vulnerabilities</li>
            <li>Educational Resources: Learn about quantum computing threats and mitigations</li>
          </ul>
          
          <h4 className="text-lg font-medium mb-2">Current Version</h4>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md mb-4">
            <p className="font-medium">Version 0.3.0</p>
            <p className="text-sm mt-1">Latest update includes:</p>
            <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
              <li>Enhanced Network Traffic Analyzer (NTA) module documentation</li>
              <li>Improved UI consistency with reusable Header and Footer components</li>
              <li>Fixed layout issues in navigation and footer elements</li>
              <li>Added initial algorithm mapping system for cryptographic protocols</li>
              <li>TLS handshake analysis visualization components (in progress)</li>
            </ul>
          </div>
          
          <h4 className="text-lg font-medium mb-2">Getting Started</h4>
          <ol className="list-decimal pl-5 mb-4 space-y-2">
            <li>Register an account or log in to access all features</li>
            <li>Navigate to the appropriate module based on your scanning needs</li>
            <li>Follow the module-specific instructions to perform scans</li>
            <li>Review results in the dashboard and implement recommended mitigations</li>
          </ol>
        </div>
      )
    },
    {
      id: 'file-scanner',
      title: 'File Scanner',
      description: 'Learn how to scan files and directories for quantum vulnerabilities',
      icon: <FiFileText className="text-green-500" size={24} />,
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">File Scanner Module</h3>
          <p className="mb-4">
            The File Scanner allows you to analyze your codebase for cryptographic implementations that may be vulnerable to quantum computing attacks.
          </p>
          
          <h4 className="text-lg font-medium mb-2">How to Perform a File Scan</h4>
          <ol className="list-decimal pl-5 mb-4 space-y-2">
            <li>Navigate to the main application interface</li>
            <li>Click on the "Upload Files" button or drag and drop files/folders into the designated area</li>
            <li>Select the cryptographic algorithms you want to scan for (or use the default selection)</li>
            <li>Click "Start Scan" to begin the analysis</li>
            <li>Wait for the scan to complete - large files or directories may take some time</li>
            <li>Review the findings in the results table</li>
          </ol>
          
          <h4 className="text-lg font-medium mb-2">Understanding File Scan Results</h4>
          <p className="mb-2">The scan results include:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>File Path</strong>: Location of the identified vulnerability</li>
            <li><strong>Line Number</strong>: Exact position in the file</li>
            <li><strong>Risk Level</strong>: Severity of the vulnerability (Low, Medium, High, Critical)</li>
            <li><strong>Algorithm</strong>: The cryptographic algorithm identified</li>
            <li><strong>Vulnerability Type</strong>: The specific vulnerability category</li>
            <li><strong>Description</strong>: Explanation of the vulnerability</li>
            <li><strong>Recommendation</strong>: Suggested mitigation steps</li>
          </ul>
          
          <h4 className="text-lg font-medium mb-2">Sample Vulnerability Types</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>RSA with small key size</strong>: Vulnerable to Shor's algorithm</li>
            <li><strong>ECC implementations</strong>: Potentially vulnerable to quantum attacks</li>
            <li><strong>Classic hash functions</strong>: May require larger output sizes</li>
            <li><strong>Symmetric encryption with insufficient key length</strong>: Vulnerable to Grover's algorithm</li>
          </ul>
        </div>
      )
    },
    {
      id: 'network-analyzer',
      title: 'Network Traffic Analyzer',
      description: 'Understand how to monitor network traffic for quantum-vulnerable communications',
      icon: <FiWifi className="text-purple-500" size={24} />,
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">Network Traffic Analyzer</h3>
          <p className="mb-4">
            The Network Traffic Analyzer monitors your network communications to identify vulnerable cryptographic protocols and implementations that could be compromised by quantum computing attacks.
          </p>
          
          <h4 className="text-lg font-medium mb-2">How to Use the Network Analyzer</h4>
          <ol className="list-decimal pl-5 mb-4 space-y-2">
            <li>Navigate to the Network Traffic Analyzer section in the main menu</li>
            <li>Click "Start Capture" to begin monitoring network traffic</li>
            <li>Specify capture filters if you want to focus on particular protocols or ports</li>
            <li>Perform the network activities you want to analyze</li>
            <li>Click "Stop Capture" when you've collected sufficient data</li>
            <li>Review the analysis results in the interface</li>
          </ol>
          
          <h4 className="text-lg font-medium mb-2">Network Analysis Features</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Protocol Detection</strong>: Identifies cryptographic protocols in use</li>
            <li><strong>TLS/SSL Analysis</strong>: Evaluates the security of encrypted connections</li>
            <li><strong>Certificate Inspection</strong>: Examines digital certificates for quantum vulnerabilities</li>
            <li><strong>Key Exchange Monitoring</strong>: Identifies vulnerable key exchange mechanisms</li>
            <li><strong>Traffic Classification</strong>: Categorizes traffic by risk level</li>
            <li><strong>Real-Time Quantum Threat Detection</strong>: Analyzes traffic patterns for potential quantum threats</li>
            <li><strong>Advanced Filtering</strong>: Sort and filter by protocol, risk level, or algorithm type</li>
            <li><strong>Packet Inspection</strong>: Deep inspection of network packets for cryptographic weaknesses</li>
          </ul>
          
          <h4 className="text-lg font-medium mb-2">Understanding Network Scan Results</h4>
          <p className="mb-2">The network analysis provides:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Source/Destination</strong>: The network endpoints involved</li>
            <li><strong>Protocol</strong>: The communication protocol detected</li>
            <li><strong>Cryptographic Methods</strong>: Algorithms used for encryption/authentication</li>
            <li><strong>Risk Assessment</strong>: Vulnerability level to quantum attacks</li>
            <li><strong>Recommendations</strong>: Suggested protocol or implementation changes</li>
          </ul>
          
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-md mb-4">
            <h4 className="text-lg font-medium mb-2 flex items-center">
              <FiAlertTriangle className="text-yellow-500 mr-2" />
              Privacy Note
            </h4>
            <p>
              The Network Traffic Analyzer operates locally within your browser and does not send captured traffic to external servers. All analysis is performed on your local machine to ensure privacy and security.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'nta-module',
      title: 'NTA Module',
      description: 'Learn about the enhanced Network Traffic Analyzer module',
      icon: <FiActivity className="text-orange-500" size={24} />,
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">Network Traffic Analyzer (NTA) Module</h3>
          <p className="mb-4">
            The enhanced NTA module provides comprehensive monitoring, analysis, and protection against quantum-vulnerable network communications.
          </p>
          
          <h4 className="text-lg font-medium mb-2">Key Features and Capabilities</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Real-time Traffic Analysis</strong>: Monitor network traffic in real-time for quantum vulnerabilities</li>
            <li><strong>Protocol Inspection</strong>: Deep inspection of cryptographic protocols in use (SSL/TLS, SSH, IPsec)</li>
            <li><strong>Algorithm Detection</strong>: Identify quantum-vulnerable cryptographic algorithms in network exchanges</li>
            <li><strong>Visual Traffic Mapping</strong>: Visualize network communications and highlight vulnerable connections</li>
            <li><strong>Detailed Risk Reports</strong>: Generate comprehensive reports of quantum vulnerability risks</li>
            <li><strong>Remediation Recommendations</strong>: Get specific guidance for upgrading to quantum-safe protocols</li>
          </ul>
          
          <h4 className="text-lg font-medium mb-2">Using the NTA Dashboard</h4>
          <p className="mb-4">
            The NTA Dashboard provides a central interface for monitoring and analyzing network traffic:
          </p>
          <ol className="list-decimal pl-5 mb-4 space-y-2">
            <li><strong>Traffic Overview</strong>: Summary metrics of analyzed traffic and detected vulnerabilities</li>
            <li><strong>Protocol Distribution</strong>: Visual breakdown of protocols in use with risk indicators</li>
            <li><strong>Vulnerability Timeline</strong>: Chronological view of detected vulnerabilities</li>
            <li><strong>Connection Map</strong>: Network diagram showing connections between hosts with risk highlighting</li>
            <li><strong>Filter Controls</strong>: Filtering options by protocol, risk level, time period, or IP address</li>
            <li><strong>Alert Configuration</strong>: Set up notifications for high-risk detections</li>
          </ol>
          
          <h4 className="text-lg font-medium mb-2">Advanced Analysis Features</h4>
          <div className="space-y-4">
            <div className="p-3 border rounded-md dark:border-gray-700">
              <h5 className="font-medium mb-1">TLS Handshake Analysis</h5>
              <p>Inspects TLS handshakes to identify quantum-vulnerable key exchanges (RSA, DH, ECDH) and recommends quantum-resistant alternatives like Kyber or NTRU.</p>
            </div>
            
            <div className="p-3 border rounded-md dark:border-gray-700">
              <h5 className="font-medium mb-1">Certificate Chain Validation</h5>
              <p>Analyzes certificate chains for quantum vulnerabilities in signature algorithms and key sizes, flagging certificates that use RSA or ECC with insufficient strength.</p>
            </div>
            
            <div className="p-3 border rounded-md dark:border-gray-700">
              <h5 className="font-medium mb-1">Encryption Analysis</h5>
              <p>Detects symmetric encryption algorithms with insufficient key lengths that may be vulnerable to Grover's algorithm, recommending increased key sizes or alternative algorithms.</p>
            </div>
            
            <div className="p-3 border rounded-md dark:border-gray-700">
              <h5 className="font-medium mb-1">Protocol Recommendation Engine</h5>
              <p>Provides specific protocol upgrade recommendations based on detected vulnerabilities, including configuration templates for implementing quantum-safe alternatives.</p>
            </div>
          </div>
          
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md mt-6">
            <h4 className="text-lg font-medium mb-2 flex items-center">
              <FiCheck className="text-green-500 mr-2" />
              Best Practices
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Run regular network scans to identify new vulnerabilities as they emerge</li>
              <li>Focus on critical infrastructure and data transfer points first</li>
              <li>Document baseline security posture before implementing changes</li>
              <li>Test quantum-safe alternatives in a staging environment before production deployment</li>
              <li>Develop a phased migration plan for transitioning to quantum-resistant protocols</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const faqs = [
    {
      id: 'faq-1',
      question: 'What is QVS-Pro and how does it help me?',
      answer: 'QVS-Pro (Quantum Vulnerability Scanner Professional) is a tool designed to identify cryptographic vulnerabilities in your code and network communications that could be exploited by quantum computers. It helps you proactively secure your systems against future quantum computing threats by identifying areas that need attention and providing recommendations for quantum-resistant alternatives.'
    },
    {
      id: 'faq-2',
      question: 'How does the file scanner work?',
      answer: 'The file scanner analyzes your code files to identify implementations of cryptographic algorithms known to be vulnerable to quantum computing attacks. It scans for patterns that indicate the use of specific algorithms like RSA, ECC, DES, and others with insufficient key lengths or outdated implementations. The scanner then provides detailed information about each vulnerability found, including the file location, line number, and recommendations for mitigation.'
    },
    {
      id: 'faq-3',
      question: 'What types of network traffic can QVS-Pro analyze?',
      answer: 'QVS-Pro can analyze various types of network traffic including HTTP/HTTPS, TLS/SSL handshakes, certificate exchanges, and other cryptographic protocol communications. It focuses on identifying vulnerable cryptographic implementations in network communications such as weak key exchanges, vulnerable cipher suites, and quantum-vulnerable certificate types.'
    },
    {
      id: 'faq-4',
      question: 'How should I interpret the scan results?',
      answer: 'Scan results are prioritized by risk level (Critical, High, Medium, Low). Each finding includes the location (file path and line number or network connection details), the vulnerable algorithm identified, a description of the vulnerability, and recommendations for mitigation. Focus on addressing Critical and High-risk findings first, as these represent the most significant vulnerabilities to quantum computing attacks.'
    },
    {
      id: 'faq-5',
      question: 'What should I do if vulnerabilities are found?',
      answer: 'For each vulnerability detected, review the recommendation provided. Typically, this involves replacing vulnerable cryptographic algorithms with quantum-resistant alternatives. Common recommendations include upgrading to post-quantum cryptography (PQC) algorithms, increasing key sizes for symmetric encryption, or implementing hybrid cryptographic solutions that combine classical and quantum-resistant approaches for a defense-in-depth strategy.'
    },
    {
      id: 'faq-6',
      question: 'Are there any false positives in the scanning results?',
      answer: 'While QVS-Pro aims to minimize false positives, they can occur particularly with complex code or when cryptographic functions are implemented in non-standard ways. Always review findings in context. If you believe a result is a false positive, you can mark it as such in the interface, which helps improve the scanning engine over time.'
    },
    {
      id: 'faq-7',
      question: 'What is the difference between the regular Network Analyzer and the NTA Module?',
      answer: 'The NTA (Network Traffic Analyzer) Module is an enhanced version of our Network Analyzer that provides more comprehensive capabilities. While the basic Network Analyzer provides fundamental traffic inspection and vulnerability detection, the NTA Module adds real-time monitoring, visual traffic mapping, detailed protocol inspection, advanced filtering, certificate chain validation, and specific remediation guidance for quantum vulnerabilities.'
    },
    {
      id: 'faq-8',
      question: 'How does the NTA Module detect quantum vulnerabilities in network traffic?',
      answer: 'The NTA Module analyzes network packets and cryptographic exchanges to identify algorithms and protocols known to be vulnerable to quantum computing attacks. It inspects TLS handshakes, certificate exchanges, key negotiation protocols, and encryption methods. The module compares these against a continuously updated database of quantum-vulnerable cryptographic implementations and provides a risk assessment based on the current state of quantum computing advancement.'
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${darkMode ? 'text-white bg-gray-900' : 'text-gray-800 bg-white'}`}>
      <div className="min-h-screen p-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <img src="/images/logo-qvs.png" alt="QVS-Pro Logo" className="logo-qvs" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Help Center</h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiX className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-grow overflow-hidden">
          {/* Sidebar */}
          <div className={`w-64 pr-4 overflow-y-auto border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Help Topics</h3>
              <ul className="space-y-2">
                {helpTopics.map(topic => (
                  <li key={topic.id}>
                    <button
                      onClick={() => setActiveSection(topic.id)}
                      className={`w-full text-left p-2 rounded flex items-center ${
                        activeSection === topic.id 
                          ? 'bg-blue-500 text-white' 
                          : `hover:bg-gray-100 dark:hover:bg-gray-800 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`
                      }`}
                    >
                      {topic.icon}
                      <span className="ml-2">{topic.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveSection('faqs')}
                    className={`w-full text-left p-2 rounded flex items-center ${
                      activeSection === 'faqs' 
                        ? 'bg-blue-500 text-white' 
                        : `hover:bg-gray-100 dark:hover:bg-gray-800 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`
                    }`}
                  >
                    <FiCpu className="text-yellow-500" size={20} />
                    <span className="ml-2">FAQs</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-grow pl-6 overflow-y-auto">
            {activeSection === 'faqs' ? (
              <div>
                <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {faqs.map(faq => (
                    <div 
                      key={faq.id} 
                      className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className={`w-full text-left p-4 flex justify-between items-center ${
                          darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{faq.question}</span>
                        {expandedFaqs.includes(faq.id) ? <FiChevronDown /> : <FiChevronRight />}
                      </button>
                      
                      {expandedFaqs.includes(faq.id) && (
                        <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              helpTopics.find(topic => topic.id === activeSection)?.content
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter; 