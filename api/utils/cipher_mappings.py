"""
Mappings between TLS protocol identifiers and their cryptographic properties.
Used by the TLS handshake inspector to determine quantum vulnerability.
"""

# TLS Cipher Suite Mapping
# Maps TLS cipher suite hex codes to their components:
# - Key Exchange method
# - Authentication method
# - Encryption algorithm and key size
# - Message Authentication Code (MAC) algorithm

TLS_CIPHER_SUITES = {
    # TLS 1.2 Cipher Suites (RFC 5246)
    # Format: (0xXX, 0xXX): {components...}
    
    # RSA Key Exchange
    (0x00, 0x2F): {
        'name': 'TLS_RSA_WITH_AES_128_CBC_SHA',
        'key_exchange': 'RSA',
        'authentication': 'RSA',
        'encryption': 'AES-128-CBC',
        'mac': 'SHA1',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with quantum-resistant key exchange'
    },
    (0x00, 0x35): {
        'name': 'TLS_RSA_WITH_AES_256_CBC_SHA',
        'key_exchange': 'RSA',
        'authentication': 'RSA',
        'encryption': 'AES-256-CBC',
        'mac': 'SHA1',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with quantum-resistant key exchange'
    },
    (0x00, 0x3C): {
        'name': 'TLS_RSA_WITH_AES_128_CBC_SHA256',
        'key_exchange': 'RSA',
        'authentication': 'RSA',
        'encryption': 'AES-128-CBC',
        'mac': 'SHA256',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with quantum-resistant key exchange'
    },
    (0x00, 0x3D): {
        'name': 'TLS_RSA_WITH_AES_256_CBC_SHA256',
        'key_exchange': 'RSA',
        'authentication': 'RSA',
        'encryption': 'AES-256-CBC',
        'mac': 'SHA256',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with quantum-resistant key exchange'
    },
    
    # ECDHE Key Exchange with RSA Authentication
    (0xC0, 0x13): {
        'name': 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
        'key_exchange': 'ECDHE',
        'authentication': 'RSA',
        'encryption': 'AES-128-CBC',
        'mac': 'SHA1',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange'
    },
    (0xC0, 0x14): {
        'name': 'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
        'key_exchange': 'ECDHE',
        'authentication': 'RSA',
        'encryption': 'AES-256-CBC',
        'mac': 'SHA1',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange'
    },
    (0xC0, 0x2F): {
        'name': 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
        'key_exchange': 'ECDHE',
        'authentication': 'RSA',
        'encryption': 'AES-128-GCM',
        'mac': 'SHA256',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange'
    },
    (0xC0, 0x30): {
        'name': 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
        'key_exchange': 'ECDHE',
        'authentication': 'RSA',
        'encryption': 'AES-256-GCM',
        'mac': 'SHA384',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange'
    },
    
    # ECDHE Key Exchange with ECDSA Authentication
    (0xC0, 0x09): {
        'name': 'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA',
        'key_exchange': 'ECDHE',
        'authentication': 'ECDSA',
        'encryption': 'AES-128-CBC',
        'mac': 'SHA1',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange and signatures'
    },
    (0xC0, 0x0A): {
        'name': 'TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA',
        'key_exchange': 'ECDHE',
        'authentication': 'ECDSA',
        'encryption': 'AES-256-CBC',
        'mac': 'SHA1',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange and signatures'
    },
    (0xC0, 0x2B): {
        'name': 'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
        'key_exchange': 'ECDHE',
        'authentication': 'ECDSA',
        'encryption': 'AES-128-GCM',
        'mac': 'SHA256',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange and signatures'
    },
    (0xC0, 0x2C): {
        'name': 'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
        'key_exchange': 'ECDHE',
        'authentication': 'ECDSA',
        'encryption': 'AES-256-GCM',
        'mac': 'SHA384',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange and signatures'
    },
    
    # DHE Key Exchange with RSA Authentication
    (0x00, 0x33): {
        'name': 'TLS_DHE_RSA_WITH_AES_128_CBC_SHA',
        'key_exchange': 'DHE',
        'authentication': 'RSA',
        'encryption': 'AES-128-CBC',
        'mac': 'SHA1',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange'
    },
    (0x00, 0x39): {
        'name': 'TLS_DHE_RSA_WITH_AES_256_CBC_SHA',
        'key_exchange': 'DHE',
        'authentication': 'RSA',
        'encryption': 'AES-256-CBC',
        'mac': 'SHA1',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange'
    },
    (0x00, 0x9E): {
        'name': 'TLS_DHE_RSA_WITH_AES_128_GCM_SHA256',
        'key_exchange': 'DHE',
        'authentication': 'RSA',
        'encryption': 'AES-128-GCM',
        'mac': 'SHA256',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange'
    },
    (0x00, 0x9F): {
        'name': 'TLS_DHE_RSA_WITH_AES_256_GCM_SHA384',
        'key_exchange': 'DHE',
        'authentication': 'RSA',
        'encryption': 'AES-256-GCM',
        'mac': 'SHA384',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with hybrid or post-quantum key exchange'
    },
    
    # TLS 1.3 Cipher Suites (RFC 8446)
    (0x13, 0x01): {
        'name': 'TLS_AES_128_GCM_SHA256',
        'key_exchange': 'Negotiated via extensions',
        'authentication': 'Negotiated via extensions',
        'encryption': 'AES-128-GCM',
        'mac': 'SHA256',
        'quantum_vulnerable': 'Depends on key exchange',
        'vulnerability_type': 'Determined by key exchange',
        'risk_level': 'Determined by key exchange',
        'recommendation': 'Ensure post-quantum or hybrid key exchange'
    },
    (0x13, 0x02): {
        'name': 'TLS_AES_256_GCM_SHA384',
        'key_exchange': 'Negotiated via extensions',
        'authentication': 'Negotiated via extensions',
        'encryption': 'AES-256-GCM',
        'mac': 'SHA384',
        'quantum_vulnerable': 'Depends on key exchange',
        'vulnerability_type': 'Determined by key exchange',
        'risk_level': 'Determined by key exchange',
        'recommendation': 'Ensure post-quantum or hybrid key exchange'
    },
    (0x13, 0x03): {
        'name': 'TLS_CHACHA20_POLY1305_SHA256',
        'key_exchange': 'Negotiated via extensions',
        'authentication': 'Negotiated via extensions',
        'encryption': 'CHACHA20-POLY1305',
        'mac': 'SHA256',
        'quantum_vulnerable': 'Depends on key exchange',
        'vulnerability_type': 'Determined by key exchange',
        'risk_level': 'Determined by key exchange',
        'recommendation': 'Ensure post-quantum or hybrid key exchange'
    },
}

# TLS Extensions mapping
TLS_EXTENSIONS = {
    # Extension types
    0x000A: {
        'name': 'supported_groups',
        'description': 'Elliptic curves/DH groups supported by client'
    },
    0x000B: {
        'name': 'ec_point_formats',
        'description': 'Elliptic curve point formats supported by client'
    },
    0x000D: {
        'name': 'signature_algorithms',
        'description': 'Signature/hash algorithms supported by client'
    },
    0x0010: {
        'name': 'application_layer_protocol_negotiation',
        'description': 'ALPN protocols (HTTP/2, etc.)'
    },
    0x0029: {
        'name': 'tls13_psk_key_exchange_modes',
        'description': 'PSK key exchange modes for TLS 1.3'
    },
    0x002B: {
        'name': 'key_share',
        'description': 'Key share extension for TLS 1.3'
    },
    0x002D: {
        'name': 'supported_versions',
        'description': 'TLS versions supported by client'
    },
}

# Elliptic Curves (Supported Groups)
SUPPORTED_GROUPS = {
    # NIST curves
    0x0017: {
        'name': 'secp256r1',
        'also_known_as': 'P-256',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum or hybrid key exchange'
    },
    0x0018: {
        'name': 'secp384r1',
        'also_known_as': 'P-384',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum or hybrid key exchange'
    },
    0x0019: {
        'name': 'secp521r1',
        'also_known_as': 'P-521',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum or hybrid key exchange'
    },
    
    # X25519 curve
    0x001D: {
        'name': 'x25519',
        'also_known_as': 'Curve25519',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum or hybrid key exchange'
    },
    0x001E: {
        'name': 'x448',
        'also_known_as': 'Curve448',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum or hybrid key exchange'
    },
    
    # Finite Field groups (non-ECC)
    0x0100: {
        'name': 'ffdhe2048',
        'also_known_as': 'DH-2048',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum or hybrid key exchange'
    },
    0x0101: {
        'name': 'ffdhe3072',
        'also_known_as': 'DH-3072',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum or hybrid key exchange'
    },
    0x0102: {
        'name': 'ffdhe4096',
        'also_known_as': 'DH-4096',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum or hybrid key exchange'
    },
    
    # Post-quantum groups (experimental/future)
    0xFE30: {
        'name': 'x25519_kyber512',
        'also_known_as': 'Hybrid X25519/Kyber512',
        'quantum_vulnerable': False,
        'vulnerability_type': "None (Hybrid)",
        'risk_level': 'Low',
        'recommendation': 'Already using hybrid key exchange'
    },
    0xFE31: {
        'name': 'x25519_kyber768',
        'also_known_as': 'Hybrid X25519/Kyber768',
        'quantum_vulnerable': False,
        'vulnerability_type': "None (Hybrid)",
        'risk_level': 'Low',
        'recommendation': 'Already using hybrid key exchange'
    },
}

# Signature Algorithms
SIGNATURE_ALGORITHMS = {
    0x0401: {
        'name': 'rsa_pkcs1_sha256',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum signatures'
    },
    0x0501: {
        'name': 'rsa_pkcs1_sha384',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum signatures'
    },
    0x0601: {
        'name': 'rsa_pkcs1_sha512',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum signatures'
    },
    0x0403: {
        'name': 'ecdsa_secp256r1_sha256',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum signatures'
    },
    0x0503: {
        'name': 'ecdsa_secp384r1_sha384',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum signatures'
    },
    0x0603: {
        'name': 'ecdsa_secp521r1_sha512',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum signatures'
    },
    0x0804: {
        'name': 'rsa_pss_rsae_sha256',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum signatures'
    },
    0x0805: {
        'name': 'rsa_pss_rsae_sha384',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum signatures'
    },
    0x0806: {
        'name': 'rsa_pss_rsae_sha512',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum signatures'
    },
    0x0807: {
        'name': 'ed25519',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum signatures'
    },
    0x0808: {
        'name': 'ed448',
        'quantum_vulnerable': True,
        'vulnerability_type': "Shor's Algorithm",
        'risk_level': 'High',
        'recommendation': 'Replace with post-quantum signatures'
    },
    # Future post-quantum signature algorithms
    0xFE00: {
        'name': 'dilithium2',
        'quantum_vulnerable': False,
        'vulnerability_type': 'None',
        'risk_level': 'Low',
        'recommendation': 'Already post-quantum safe'
    },
    0xFE01: {
        'name': 'dilithium3',
        'quantum_vulnerable': False,
        'vulnerability_type': 'None',
        'risk_level': 'Low',
        'recommendation': 'Already post-quantum safe'
    },
    0xFE02: {
        'name': 'dilithium5',
        'quantum_vulnerable': False,
        'vulnerability_type': 'None',
        'risk_level': 'Low',
        'recommendation': 'Already post-quantum safe'
    },
}

# TLS Versions
TLS_VERSIONS = {
    0x0301: {
        'name': 'TLS 1.0',
        'secure': False,  # Generally considered insecure due to multiple vulnerabilities
        'recommendation': 'Upgrade to TLS 1.2 or TLS 1.3'
    },
    0x0302: {
        'name': 'TLS 1.1',
        'secure': False,  # Generally considered insecure due to multiple vulnerabilities
        'recommendation': 'Upgrade to TLS 1.2 or TLS 1.3'
    },
    0x0303: {
        'name': 'TLS 1.2',
        'secure': True,   # Secure if configured properly
        'recommendation': 'Ensure proper configuration, consider upgrading to TLS 1.3'
    },
    0x0304: {
        'name': 'TLS 1.3',
        'secure': True,   # Most secure version
        'recommendation': 'Ensure post-quantum readiness'
    },
} 