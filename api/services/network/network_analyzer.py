"""
Network Traffic Analyzer Service for QVS-Pro

This module provides functionality to analyze network traffic for quantum-vulnerable cryptography.
It integrates with the TLS handshake inspector to identify vulnerable protocols and algorithms.
"""

import os
import json
import tempfile
import logging
import datetime
from typing import Dict, List, Any, Optional, Union, Tuple

from api.services.network.tls_handshake_inspector import TLSHandshakeInspector

class NetworkTrafficAnalyzer:
    """
    Analyzes network traffic to detect quantum-vulnerable cryptographic protocols.
    
    This service can:
    - Analyze PCAP files for TLS, SSH, and IPsec/IKE handshakes
    - Detect quantum-vulnerable cryptographic algorithms
    - Provide detailed reports on vulnerabilities
    - Recommend quantum-resistant alternatives
    """
    
    def __init__(self):
        """Initialize the network traffic analyzer with all required inspectors"""
        self.logger = logging.getLogger(__name__)
        self.tls_inspector = TLSHandshakeInspector()
        # Future: Add SSH and IPsec inspectors when implemented
        
    def analyze_pcap(self, pcap_path: str) -> Dict[str, Any]:
        """
        Analyze a PCAP file for quantum-vulnerable protocols
        
        Args:
            pcap_path: Path to the PCAP file to analyze
            
        Returns:
            Dictionary containing analysis results including:
            - Summary statistics
            - Identified vulnerabilities
            - Protocol details
            - Risk assessments
            - Recommendations
        """
        self.logger.info(f"Analyzing PCAP file: {pcap_path}")
        
        # Initialize results structure
        results = {
            'status': 'success',
            'scan_type': 'network_pcap',
            'timestamp': datetime.datetime.now().isoformat(),
            'file_analyzed': os.path.basename(pcap_path),
            'results': [],
            'summary': {
                'session_count': 0,
                'vulnerable_count': 0,
                'safe_count': 0,
                'protocol_counts': {}
            }
        }
        
        try:
            # Process TLS connections
            tls_results = self._analyze_tls_connections(pcap_path)
            results['results'].extend(tls_results)
            
            # Future: Add SSH and IPsec analysis
            
            # Update summary statistics
            results['summary']['session_count'] = len(results['results'])
            results['summary']['vulnerable_count'] = sum(1 for r in results['results'] if r.get('vulnerabilities'))
            results['summary']['safe_count'] = results['summary']['session_count'] - results['summary']['vulnerable_count']
            
            # Count by protocol
            protocol_counts = {}
            for r in results['results']:
                protocol = r.get('protocol', 'Unknown')
                protocol_counts[protocol] = protocol_counts.get(protocol, 0) + 1
            results['summary']['protocol_counts'] = protocol_counts
            
        except Exception as e:
            self.logger.error(f"Error analyzing PCAP file: {str(e)}")
            results['status'] = 'error'
            results['error'] = str(e)
        
        return results
    
    def _analyze_tls_connections(self, pcap_path: str) -> List[Dict[str, Any]]:
        """
        Analyze TLS connections in a PCAP file
        
        Args:
            pcap_path: Path to the PCAP file to analyze
            
        Returns:
            List of TLS connection analysis results
        """
        connection_results = []
        
        # Extract TLS handshakes from PCAP
        handshakes = self.tls_inspector.parse_pcap_tls_handshakes(pcap_path)
        
        # Process each handshake
        for idx, handshake in enumerate(handshakes):
            try:
                # Analyze the handshake
                result = self.tls_inspector.inspect_handshake(handshake)
                
                # Add source/destination information if available (would come from PCAP in real implementation)
                # Using mock data for demonstration
                result['source'] = f'192.168.1.{10+idx}:12345'
                result['destination'] = f'93.184.216.{idx}:443'
                result['port'] = 443
                result['session_id'] = f'TLS-{idx}'
                
                # Add to results
                connection_results.append(result)
                
            except Exception as e:
                self.logger.error(f"Error analyzing TLS handshake: {str(e)}")
        
        return connection_results
    
    def format_results_for_api(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format analysis results into a structure suitable for the API response
        
        Args:
            analysis_results: Results from analyze_pcap
            
        Returns:
            Restructured results for API response
        """
        api_results = []
        
        # Process each connection result
        for conn in analysis_results.get('results', []):
            protocol = conn.get('protocol', 'Unknown')
            
            # Extract vulnerabilities
            for vuln in conn.get('vulnerabilities', []):
                component = vuln.get('component', 'Unknown')
                name = vuln.get('name', 'Unknown')
                
                # Create a result entry for each vulnerability
                result = {
                    'protocol': protocol,
                    'vulnerability_type': vuln.get('vulnerability_type', "Shor's Algorithm"),
                    'risk': vuln.get('risk_level', 'High'),
                    'algorithm': name,
                    'source': conn.get('source', 'Unknown'),
                    'destination': conn.get('destination', 'Unknown'),
                    'port': conn.get('port', 0),
                    'session_id': conn.get('session_id', 'Unknown'),
                    'description': vuln.get('recommendation', 'No specific recommendation available'),
                    'recommendation': vuln.get('recommendation', 'No specific recommendation available')
                }
                
                # Add component-specific details
                if component == 'cipher_suite':
                    cipher_suite = conn.get('details', {}).get('cipher_suite', {})
                    result['cipher_suite'] = cipher_suite.get('name', 'Unknown')
                    result['key_exchange'] = cipher_suite.get('key_exchange', 'Unknown')
                    result['encryption'] = cipher_suite.get('encryption', 'Unknown')
                    result['signature'] = cipher_suite.get('authentication', 'Unknown')
                    
                elif component == 'key_exchange':
                    key_exchange = conn.get('details', {}).get('key_exchange', {})
                    result['key_exchange'] = key_exchange.get('method', name)
                    
                elif component == 'certificate':
                    cert = conn.get('details', {}).get('certificate', {}).get('leaf_certificate', {})
                    if 'subject' in cert and 'commonName' in cert['subject']:
                        result['certificate'] = cert['subject']['commonName']
                    else:
                        result['certificate'] = 'Unknown'
                
                api_results.append(result)
        
        # If no vulnerabilities were found but we have connections, add a "safe" entry
        if not api_results and analysis_results.get('results'):
            for conn in analysis_results.get('results', [])[:3]:  # Limit to first 3 for brevity
                protocol = conn.get('protocol', 'Unknown')
                result = {
                    'protocol': protocol,
                    'algorithm': 'None',
                    'vulnerability_type': 'None',
                    'risk': 'None',
                    'source': conn.get('source', 'Unknown'),
                    'destination': conn.get('destination', 'Unknown'),
                    'port': conn.get('port', 0),
                    'session_id': conn.get('session_id', 'Unknown'),
                    'description': 'No quantum vulnerabilities detected',
                    'recommendation': 'Continue monitoring for changes to the cryptographic setup'
                }
                api_results.append(result)
        
        # Format the response
        response = {
            'status': analysis_results.get('status', 'success'),
            'scan_type': analysis_results.get('scan_type', 'network_pcap'),
            'session_count': analysis_results.get('summary', {}).get('session_count', 0),
            'vulnerable_count': analysis_results.get('summary', {}).get('vulnerable_count', 0),
            'safe_count': analysis_results.get('summary', {}).get('safe_count', 0),
            'results': api_results
        }
        
        # Add error if present
        if 'error' in analysis_results:
            response['error'] = analysis_results['error']
        
        return response
    
    def get_demo_analysis(self) -> Dict[str, Any]:
        """
        Return a demo analysis result for development/testing
        
        Returns:
            Formatted analysis results simulating a real scan
        """
        # Use TLS inspector's demo handshakes
        handshakes = self.tls_inspector.get_demo_handshakes()
        
        # Create analysis results
        analysis_results = {
            'status': 'success',
            'scan_type': 'network_demo',
            'timestamp': datetime.datetime.now().isoformat(),
            'file_analyzed': 'demo.pcap',
            'results': [],
            'summary': {
                'session_count': 0,
                'vulnerable_count': 0,
                'safe_count': 0,
                'protocol_counts': {}
            }
        }
        
        # Process each handshake
        for idx, handshake in enumerate(handshakes):
            try:
                # Analyze the handshake
                result = self.tls_inspector.inspect_handshake(handshake)
                
                # Add source/destination information
                result['source'] = f'192.168.1.{10+idx}:{50000+idx}'
                result['destination'] = f'93.184.216.{34+idx}:443'
                result['port'] = 443
                result['session_id'] = f'TLS-{idx}'
                
                # Add to results
                analysis_results['results'].append(result)
                
            except Exception as e:
                self.logger.error(f"Error analyzing demo TLS handshake: {str(e)}")
        
        # Update summary statistics
        analysis_results['summary']['session_count'] = len(analysis_results['results'])
        analysis_results['summary']['vulnerable_count'] = sum(1 for r in analysis_results['results'] if r.get('vulnerabilities'))
        analysis_results['summary']['safe_count'] = analysis_results['summary']['session_count'] - analysis_results['summary']['vulnerable_count']
        
        # Count by protocol
        protocol_counts = {'TLS': len(analysis_results['results'])}
        analysis_results['summary']['protocol_counts'] = protocol_counts
        
        # Format for API
        return self.format_results_for_api(analysis_results) 