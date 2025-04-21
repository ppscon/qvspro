"""
TLS Handshake Inspector for QVS-Pro

This module provides functionality to analyze TLS handshakes for quantum vulnerabilities.
It can extract and analyze:
- TLS version information
- Cipher suites
- Key exchange methods
- Certificate information
- Signature algorithms
"""

import os
import json
import base64
import binascii
import logging
import datetime
from typing import Dict, List, Tuple, Any, Optional, Union

# Try to import cryptography for cert analysis
try:
    from cryptography import x509
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives.asymmetric import rsa, ec, dsa
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False

# Import TLS cipher suite and protocol mappings
from api.utils.cipher_mappings import (
    TLS_CIPHER_SUITES,
    TLS_EXTENSIONS,
    SUPPORTED_GROUPS,
    SIGNATURE_ALGORITHMS,
    TLS_VERSIONS
)

class TLSHandshakeInspector:
    """
    Analyzes TLS handshake messages to identify quantum-vulnerable cryptography.
    
    This class implements advanced TLS protocol inspection to identify:
    - Vulnerable key exchange methods (RSA, ECDHE, DHE)
    - Vulnerable authentication methods (RSA, ECDSA)
    - Certificate key types and parameters
    - Protocol version and security issues
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def inspect_handshake(self, handshake_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a TLS handshake for quantum vulnerabilities.
        
        Args:
            handshake_data: Dictionary containing parsed TLS handshake messages
                Expected to have at least client_hello and server_hello data
                
        Returns:
            Dictionary with analysis results including:
            - Identified vulnerabilities
            - Protocol details
            - Risk assessment
            - Recommendations
        """
        results = {
            'protocol': 'TLS',
            'timestamp': datetime.datetime.now().isoformat(),
            'vulnerabilities': [],
            'details': {},
            'summary': {}
        }
        
        # Extract TLS version
        tls_version = self._extract_tls_version(handshake_data)
        if tls_version:
            results['details']['tls_version'] = tls_version
            
        # Extract cipher suite information
        cipher_suite = self._extract_cipher_suite(handshake_data)
        if cipher_suite:
            results['details']['cipher_suite'] = cipher_suite
            
        # Extract key exchange and authentication methods
        key_exchange = self._extract_key_exchange(handshake_data)
        if key_exchange:
            results['details']['key_exchange'] = key_exchange
            
        # Extract certificate information
        certificate_info = self._extract_certificate_info(handshake_data)
        if certificate_info:
            results['details']['certificate'] = certificate_info
            
        # Analyze for quantum vulnerabilities
        vulnerabilities = self._analyze_vulnerabilities(results['details'])
        if vulnerabilities:
            results['vulnerabilities'] = vulnerabilities
            
        # Generate summary
        results['summary'] = self._generate_summary(results)
        
        return results
    
    def _extract_tls_version(self, handshake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract TLS version information from handshake data"""
        tls_version_info = {}
        
        # Check if we have server hello data
        if 'server_hello' in handshake_data:
            server_hello = handshake_data['server_hello']
            
            # Check for TLS 1.3 supported_versions extension
            if 'extensions' in server_hello and 'supported_versions' in server_hello['extensions']:
                version_code = server_hello['extensions']['supported_versions']
                if isinstance(version_code, int) and version_code in TLS_VERSIONS:
                    tls_version_info = TLS_VERSIONS[version_code].copy()
                    tls_version_info['version_code'] = hex(version_code)
            
            # Fallback to legacy protocol version field
            elif 'version' in server_hello:
                version_code = server_hello['version']
                if isinstance(version_code, int) and version_code in TLS_VERSIONS:
                    tls_version_info = TLS_VERSIONS[version_code].copy()
                    tls_version_info['version_code'] = hex(version_code)
        
        # If server hello is missing, try from client hello
        elif 'client_hello' in handshake_data:
            client_hello = handshake_data['client_hello']
            
            # Check for TLS 1.3 supported_versions extension
            if 'extensions' in client_hello and 'supported_versions' in client_hello['extensions']:
                versions = client_hello['extensions']['supported_versions']
                if isinstance(versions, list) and versions:
                    # Use the highest supported version
                    highest_version = max(versions)
                    if highest_version in TLS_VERSIONS:
                        tls_version_info = TLS_VERSIONS[highest_version].copy()
                        tls_version_info['version_code'] = hex(highest_version)
                        tls_version_info['client_supported_versions'] = [
                            {'code': hex(v), 'name': TLS_VERSIONS.get(v, {}).get('name', 'Unknown')}
                            for v in versions if v in TLS_VERSIONS
                        ]
            
            # Fallback to legacy protocol version field
            elif 'version' in client_hello:
                version_code = client_hello['version']
                if isinstance(version_code, int) and version_code in TLS_VERSIONS:
                    tls_version_info = TLS_VERSIONS[version_code].copy()
                    tls_version_info['version_code'] = hex(version_code)
                    
        return tls_version_info
    
    def _extract_cipher_suite(self, handshake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract cipher suite information from handshake data"""
        cipher_suite_info = {}
        
        # Check if we have server hello data with chosen cipher suite
        if 'server_hello' in handshake_data and 'cipher_suite' in handshake_data['server_hello']:
            server_hello = handshake_data['server_hello']
            cipher_code = server_hello['cipher_suite']
            
            # Convert to tuple format if necessary
            if isinstance(cipher_code, list) and len(cipher_code) == 2:
                cipher_tuple = (cipher_code[0], cipher_code[1])
            elif isinstance(cipher_code, int):
                cipher_tuple = ((cipher_code >> 8) & 0xFF, cipher_code & 0xFF)
            else:
                cipher_tuple = None
                
            if cipher_tuple and cipher_tuple in TLS_CIPHER_SUITES:
                cipher_suite_info = TLS_CIPHER_SUITES[cipher_tuple].copy()
                cipher_suite_info['cipher_code'] = '0x{:02X},0x{:02X}'.format(*cipher_tuple)
        
        # If we also have client hello data, extract offered cipher suites
        if 'client_hello' in handshake_data and 'cipher_suites' in handshake_data['client_hello']:
            client_hello = handshake_data['client_hello']
            offered_suites = client_hello['cipher_suites']
            
            if isinstance(offered_suites, list) and offered_suites:
                cipher_suite_info['offered_cipher_suites'] = []
                
                for suite in offered_suites:
                    # Convert to tuple format if necessary
                    if isinstance(suite, list) and len(suite) == 2:
                        suite_tuple = (suite[0], suite[1])
                    elif isinstance(suite, int):
                        suite_tuple = ((suite >> 8) & 0xFF, suite & 0xFF)
                    else:
                        continue
                        
                    if suite_tuple in TLS_CIPHER_SUITES:
                        suite_info = {
                            'name': TLS_CIPHER_SUITES[suite_tuple]['name'],
                            'cipher_code': '0x{:02X},0x{:02X}'.format(*suite_tuple)
                        }
                        cipher_suite_info['offered_cipher_suites'].append(suite_info)
        
        return cipher_suite_info
    
    def _extract_key_exchange(self, handshake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract key exchange and supported groups information"""
        key_exchange_info = {}
        
        # For TLS 1.3, key exchange is in key_share extensions
        if ('client_hello' in handshake_data and 'extensions' in handshake_data['client_hello'] and
            'key_share' in handshake_data['client_hello']['extensions']):
            
            client_key_share = handshake_data['client_hello']['extensions']['key_share']
            if isinstance(client_key_share, list):
                key_exchange_info['client_key_shares'] = []
                
                for key_share in client_key_share:
                    if isinstance(key_share, dict) and 'group' in key_share:
                        group_id = key_share['group']
                        if group_id in SUPPORTED_GROUPS:
                            share_info = SUPPORTED_GROUPS[group_id].copy()
                            share_info['group_id'] = hex(group_id)
                            key_exchange_info['client_key_shares'].append(share_info)
        
            # If server hello also has key_share, extract the selected group
            if ('server_hello' in handshake_data and 'extensions' in handshake_data['server_hello'] and
                'key_share' in handshake_data['server_hello']['extensions']):
                
                server_key_share = handshake_data['server_hello']['extensions']['key_share']
                if isinstance(server_key_share, dict) and 'group' in server_key_share:
                    group_id = server_key_share['group']
                    if group_id in SUPPORTED_GROUPS:
                        key_exchange_info['selected_group'] = SUPPORTED_GROUPS[group_id].copy()
                        key_exchange_info['selected_group']['group_id'] = hex(group_id)
        
        # For TLS 1.2, key exchange comes from the cipher suite
        elif ('server_hello' in handshake_data and 'cipher_suite' in handshake_data['server_hello']):
            server_hello = handshake_data['server_hello']
            cipher_code = server_hello['cipher_suite']
            
            # Convert to tuple format if necessary
            if isinstance(cipher_code, list) and len(cipher_code) == 2:
                cipher_tuple = (cipher_code[0], cipher_code[1])
            elif isinstance(cipher_code, int):
                cipher_tuple = ((cipher_code >> 8) & 0xFF, cipher_code & 0xFF)
            else:
                cipher_tuple = None
                
            if cipher_tuple and cipher_tuple in TLS_CIPHER_SUITES:
                cipher_info = TLS_CIPHER_SUITES[cipher_tuple]
                if 'key_exchange' in cipher_info:
                    key_exchange_info['method'] = cipher_info['key_exchange']
                    
                    # If the key exchange is ECDHE or DHE, check for supported groups
                    if cipher_info['key_exchange'] in ['ECDHE', 'DHE']:
                        if ('client_hello' in handshake_data and 'extensions' in handshake_data['client_hello'] and
                            'supported_groups' in handshake_data['client_hello']['extensions']):
                            
                            groups = handshake_data['client_hello']['extensions']['supported_groups']
                            if isinstance(groups, list):
                                key_exchange_info['supported_groups'] = []
                                
                                for group_id in groups:
                                    if group_id in SUPPORTED_GROUPS:
                                        group_info = SUPPORTED_GROUPS[group_id].copy()
                                        group_info['group_id'] = hex(group_id)
                                        key_exchange_info['supported_groups'].append(group_info)
                                        
                        # Extract server key exchange parameters if available
                        if 'server_key_exchange' in handshake_data:
                            ske = handshake_data['server_key_exchange']
                            if 'curve_id' in ske and ske['curve_id'] in SUPPORTED_GROUPS:
                                group_id = ske['curve_id']
                                key_exchange_info['selected_group'] = SUPPORTED_GROUPS[group_id].copy()
                                key_exchange_info['selected_group']['group_id'] = hex(group_id)
                            elif 'dh_p_len' in ske:
                                # This is a finite field DH key exchange
                                key_exchange_info['selected_group'] = {
                                    'name': 'Custom DH parameters',
                                    'also_known_as': f"DH-{ske.get('dh_p_len', 0) * 8} (approx)",
                                    'quantum_vulnerable': True,
                                    'vulnerability_type': "Shor's Algorithm",
                                    'risk_level': 'High',
                                    'recommendation': 'Replace with post-quantum or hybrid key exchange'
                                }
                            
        # Check for signature algorithms
        if ('client_hello' in handshake_data and 'extensions' in handshake_data['client_hello'] and
            'signature_algorithms' in handshake_data['client_hello']['extensions']):
            
            sig_algs = handshake_data['client_hello']['extensions']['signature_algorithms']
            if isinstance(sig_algs, list):
                key_exchange_info['signature_algorithms'] = []
                
                for sig_alg in sig_algs:
                    if sig_alg in SIGNATURE_ALGORITHMS:
                        sig_info = SIGNATURE_ALGORITHMS[sig_alg].copy()
                        sig_info['sig_alg_id'] = hex(sig_alg)
                        key_exchange_info['signature_algorithms'].append(sig_info)
        
        return key_exchange_info
    
    def _extract_certificate_info(self, handshake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and analyze certificate information"""
        certificate_info = {}
        
        # Check if we have certificate data (only available for TLS 1.2 in plaintext)
        if 'certificate' in handshake_data and 'certificates' in handshake_data['certificate']:
            certificates = handshake_data['certificate']['certificates']
            
            if isinstance(certificates, list) and certificates and CRYPTOGRAPHY_AVAILABLE:
                cert_chain = []
                
                for cert_data in certificates:
                    if not isinstance(cert_data, bytes):
                        continue
                        
                    try:
                        cert = x509.load_der_x509_certificate(cert_data, default_backend())
                        cert_info = self._analyze_certificate(cert)
                        cert_chain.append(cert_info)
                    except Exception as e:
                        self.logger.error(f"Error analyzing certificate: {str(e)}")
                
                if cert_chain:
                    certificate_info['chain'] = cert_chain
                    certificate_info['leaf_certificate'] = cert_chain[0]
                    
                    # Check if the certificate uses a quantum-vulnerable key
                    if 'public_key' in cert_chain[0]:
                        key_info = cert_chain[0]['public_key']
                        certificate_info['quantum_vulnerable'] = key_info.get('quantum_vulnerable', True)
                        certificate_info['vulnerability_type'] = key_info.get('vulnerability_type', "Shor's Algorithm")
                        certificate_info['risk_level'] = key_info.get('risk_level', 'High')
                        certificate_info['recommendation'] = key_info.get('recommendation', 
                            'Replace with post-quantum certificates')
        
        return certificate_info
    
    def _analyze_certificate(self, cert: x509.Certificate) -> Dict[str, Any]:
        """Analyze a certificate for quantum vulnerabilities"""
        cert_info = {
            'subject': self._format_name(cert.subject),
            'issuer': self._format_name(cert.issuer),
            'not_before': cert.not_valid_before.isoformat(),
            'not_after': cert.not_valid_after.isoformat(),
            'serial_number': format(cert.serial_number, 'x')
        }
        
        # Extract subject alternative names
        try:
            san_ext = cert.extensions.get_extension_for_oid(x509.ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
            if san_ext:
                san = san_ext.value
                cert_info['subject_alternative_names'] = []
                
                # DNS names
                if san.get_values_for_type(x509.DNSName):
                    cert_info['subject_alternative_names'].extend([
                        {'type': 'DNS', 'value': name}
                        for name in san.get_values_for_type(x509.DNSName)
                    ])
                
                # IP addresses
                if san.get_values_for_type(x509.IPAddress):
                    cert_info['subject_alternative_names'].extend([
                        {'type': 'IP', 'value': str(ip)}
                        for ip in san.get_values_for_type(x509.IPAddress)
                    ])
        except x509.ExtensionNotFound:
            pass
        
        # Analyze public key
        public_key = cert.public_key()
        
        if isinstance(public_key, rsa.RSAPublicKey):
            key_size = public_key.key_size
            cert_info['public_key'] = {
                'algorithm': 'RSA',
                'key_size': key_size,
                'quantum_vulnerable': True,
                'vulnerability_type': "Shor's Algorithm",
                'risk_level': 'High',
                'recommendation': 'Replace with post-quantum certificates'
            }
            
        elif isinstance(public_key, ec.EllipticCurvePublicKey):
            curve = public_key.curve
            curve_name = curve.name
            key_size = self._get_ec_key_size(curve)
            
            cert_info['public_key'] = {
                'algorithm': 'ECC',
                'curve': curve_name,
                'key_size_bits': key_size,
                'quantum_vulnerable': True,
                'vulnerability_type': "Shor's Algorithm",
                'risk_level': 'High',
                'recommendation': 'Replace with post-quantum certificates'
            }
            
        elif isinstance(public_key, dsa.DSAPublicKey):
            key_size = public_key.key_size
            cert_info['public_key'] = {
                'algorithm': 'DSA',
                'key_size': key_size,
                'quantum_vulnerable': True,
                'vulnerability_type': "Shor's Algorithm",
                'risk_level': 'High',
                'recommendation': 'Replace with post-quantum certificates'
            }
            
        return cert_info
    
    def _format_name(self, name: x509.Name) -> Dict[str, str]:
        """Format X.509 name into a dictionary"""
        result = {}
        
        for attribute in name:
            oid_name = attribute.oid._name
            result[oid_name] = attribute.value
            
        return result
    
    def _get_ec_key_size(self, curve: ec.EllipticCurve) -> int:
        """Get the key size in bits for an elliptic curve"""
        curve_name = curve.name
        
        if curve_name == 'secp256r1':
            return 256
        elif curve_name == 'secp384r1':
            return 384
        elif curve_name == 'secp521r1':
            return 521
        elif curve_name == 'secp224r1':
            return 224
        elif curve_name == 'secp192r1':
            return 192
        elif 'brainpoolP256r1' in curve_name:
            return 256
        elif 'brainpoolP384r1' in curve_name:
            return 384
        elif 'brainpoolP512r1' in curve_name:
            return 512
        else:
            # Default approximate value
            return 256
    
    def _analyze_vulnerabilities(self, details: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze details to identify quantum vulnerabilities"""
        vulnerabilities = []
        
        # Check for cipher suite vulnerabilities
        if 'cipher_suite' in details:
            cipher_suite = details['cipher_suite']
            
            # Check if the cipher suite is quantum vulnerable
            if cipher_suite.get('quantum_vulnerable') is True:
                vulnerabilities.append({
                    'component': 'cipher_suite',
                    'name': cipher_suite.get('name', 'Unknown Cipher Suite'),
                    'vulnerability_type': cipher_suite.get('vulnerability_type', "Shor's Algorithm"),
                    'risk_level': cipher_suite.get('risk_level', 'High'),
                    'recommendation': cipher_suite.get('recommendation', 
                        'Replace with quantum-resistant algorithms')
                })
        
        # Check for key exchange vulnerabilities
        if 'key_exchange' in details:
            key_exchange = details['key_exchange']
            
            # Check if a selected group is specified and vulnerable
            if 'selected_group' in key_exchange:
                selected_group = key_exchange['selected_group']
                
                if selected_group.get('quantum_vulnerable') is True:
                    vulnerabilities.append({
                        'component': 'key_exchange',
                        'name': f"{key_exchange.get('method', 'Unknown')} with {selected_group.get('name', 'Unknown Group')}",
                        'vulnerability_type': selected_group.get('vulnerability_type', "Shor's Algorithm"),
                        'risk_level': selected_group.get('risk_level', 'High'),
                        'recommendation': selected_group.get('recommendation', 
                            'Replace with post-quantum or hybrid key exchange')
                    })
            
            # If no selected group but we have a method, check based on method
            elif 'method' in key_exchange:
                method = key_exchange['method']
                
                # RSA, ECDHE, and DHE are all vulnerable to quantum attacks
                if method in ['RSA', 'ECDHE', 'DHE']:
                    vulnerabilities.append({
                        'component': 'key_exchange',
                        'name': method,
                        'vulnerability_type': "Shor's Algorithm",
                        'risk_level': 'High',
                        'recommendation': 'Replace with post-quantum or hybrid key exchange'
                    })
        
        # Check for certificate vulnerabilities
        if 'certificate' in details:
            certificate = details['certificate']
            
            if certificate.get('quantum_vulnerable') is True:
                vulnerabilities.append({
                    'component': 'certificate',
                    'name': f"{certificate.get('leaf_certificate', {}).get('public_key', {}).get('algorithm', 'Unknown')} Certificate",
                    'vulnerability_type': certificate.get('vulnerability_type', "Shor's Algorithm"),
                    'risk_level': certificate.get('risk_level', 'High'),
                    'recommendation': certificate.get('recommendation', 
                        'Replace with post-quantum certificates')
                })
        
        return vulnerabilities
    
    def _generate_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a summary of the analysis results"""
        details = results.get('details', {})
        vulnerabilities = results.get('vulnerabilities', [])
        
        summary = {
            'quantum_vulnerable': bool(vulnerabilities),
            'vulnerability_count': len(vulnerabilities),
            'identified_algorithms': [],
            'overall_risk': 'Low' if not vulnerabilities else max(
                v.get('risk_level', 'Low') for v in vulnerabilities
            )
        }
        
        # Collect identified algorithms
        if 'cipher_suite' in details:
            cipher_info = details['cipher_suite']
            if 'name' in cipher_info:
                summary['identified_algorithms'].append(cipher_info['name'])
                
        if 'key_exchange' in details and 'method' in details['key_exchange']:
            method = details['key_exchange']['method']
            if 'selected_group' in details['key_exchange']:
                group = details['key_exchange']['selected_group'].get('name', '')
                summary['identified_algorithms'].append(f"{method} with {group}")
            else:
                summary['identified_algorithms'].append(method)
                
        if 'certificate' in details and 'leaf_certificate' in details['certificate']:
            cert = details['certificate']['leaf_certificate']
            if 'public_key' in cert:
                pk = cert['public_key']
                algo = pk.get('algorithm', '')
                if algo == 'RSA':
                    key_size = pk.get('key_size', '')
                    summary['identified_algorithms'].append(f"{algo}-{key_size}")
                elif algo == 'ECC':
                    curve = pk.get('curve', '')
                    summary['identified_algorithms'].append(f"{algo} {curve}")
                else:
                    summary['identified_algorithms'].append(algo)
        
        return summary
        
    @staticmethod
    def parse_pcap_tls_handshakes(pcap_file: str) -> List[Dict[str, Any]]:
        """
        Parse TLS handshakes from a PCAP file
        
        This is a placeholder implementation. In a real implementation,
        this would use libraries like Scapy, dpkt, or PcapPlusPlus to parse
        the PCAP file and extract TLS handshakes.
        
        Args:
            pcap_file: Path to the PCAP file to analyze
            
        Returns:
            List of dictionaries containing parsed TLS handshake messages
        """
        # In a real implementation, this would be replaced with actual parsing logic
        # For now, return demo data for development/testing
        return TLSHandshakeInspector.get_demo_handshakes()
    
    @staticmethod
    def get_demo_handshakes() -> List[Dict[str, Any]]:
        """Return demo TLS handshake data for development/testing"""
        return [
            # TLS 1.2 handshake with RSA key exchange
            {
                'client_hello': {
                    'version': 0x0303,  # TLS 1.2
                    'cipher_suites': [
                        [0xC0, 0x2F],  # TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
                        [0x00, 0x2F],  # TLS_RSA_WITH_AES_128_CBC_SHA
                        [0x00, 0x35]   # TLS_RSA_WITH_AES_256_CBC_SHA
                    ],
                    'extensions': {
                        'supported_groups': [0x0017, 0x0018], # secp256r1, secp384r1
                        'signature_algorithms': [0x0403, 0x0401] # ecdsa_secp256r1_sha256, rsa_pkcs1_sha256
                    }
                },
                'server_hello': {
                    'version': 0x0303,  # TLS 1.2
                    'cipher_suite': [0x00, 0x2F]  # TLS_RSA_WITH_AES_128_CBC_SHA
                },
                'certificate': {
                    'certificates': []  # Would contain raw certificate bytes
                }
            },
            # TLS 1.2 handshake with ECDHE key exchange
            {
                'client_hello': {
                    'version': 0x0303,  # TLS 1.2
                    'cipher_suites': [
                        [0xC0, 0x2F],  # TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
                        [0xC0, 0x2B],  # TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
                        [0x00, 0x2F]   # TLS_RSA_WITH_AES_128_CBC_SHA
                    ],
                    'extensions': {
                        'supported_groups': [0x0017, 0x0018, 0x0019], # secp256r1, secp384r1, secp521r1
                        'signature_algorithms': [0x0403, 0x0503, 0x0603] # ecdsa with various hashes
                    }
                },
                'server_hello': {
                    'version': 0x0303,  # TLS 1.2
                    'cipher_suite': [0xC0, 0x2F]  # TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
                },
                'server_key_exchange': {
                    'curve_id': 0x0017  # secp256r1
                },
                'certificate': {
                    'certificates': []  # Would contain raw certificate bytes
                }
            },
            # TLS 1.3 handshake
            {
                'client_hello': {
                    'version': 0x0303,  # TLS 1.2 (legacy field)
                    'cipher_suites': [
                        [0x13, 0x01],  # TLS_AES_128_GCM_SHA256
                        [0x13, 0x02],  # TLS_AES_256_GCM_SHA384
                        [0x13, 0x03]   # TLS_CHACHA20_POLY1305_SHA256
                    ],
                    'extensions': {
                        'supported_versions': [0x0304, 0x0303], # TLS 1.3, TLS 1.2
                        'supported_groups': [0x001D, 0x0017, 0x0018], # x25519, secp256r1, secp384r1
                        'signature_algorithms': [0x0804, 0x0403], # rsa_pss_rsae_sha256, ecdsa_secp256r1_sha256
                        'key_share': [
                            {'group': 0x001D, 'key_exchange': b''},  # x25519
                            {'group': 0x0017, 'key_exchange': b''}   # secp256r1
                        ]
                    }
                },
                'server_hello': {
                    'version': 0x0303,  # TLS 1.2 (legacy field)
                    'cipher_suite': [0x13, 0x01],  # TLS_AES_128_GCM_SHA256
                    'extensions': {
                        'supported_versions': 0x0304,  # TLS 1.3
                        'key_share': {'group': 0x001D, 'key_exchange': b''}  # x25519
                    }
                }
                # Certificate is encrypted in TLS 1.3
            }
        ] 