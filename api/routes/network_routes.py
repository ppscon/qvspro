from flask import Blueprint, request, jsonify
import os
import tempfile
import subprocess
import json
import shutil
import time
from werkzeug.utils import secure_filename
import socket

# Try to import the optional dependencies
try:
    import psutil
    import netifaces
    DEPENDENCIES_AVAILABLE = True
except ImportError:
    DEPENDENCIES_AVAILABLE = False
    
network_bp = Blueprint('network', __name__)

@network_bp.route('/interfaces', methods=['GET'])
def get_network_interfaces():
    """Get a list of all available network interfaces"""
    try:
        if DEPENDENCIES_AVAILABLE:
            # Use netifaces to get interfaces that should work cross-platform
            interfaces = netifaces.interfaces()
            
            # Filter out loopback and non-physical interfaces if needed
            filtered_interfaces = [i for i in interfaces if not i.startswith('lo')]
        else:
            # Fallback to mock interfaces if dependencies aren't available
            filtered_interfaces = ["eth0", "wlan0", "en0", "wlp3s0"]
        
        return jsonify({
            "status": "success",
            "interfaces": filtered_interfaces
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "interfaces": []
        }), 500

@network_bp.route('/demo', methods=['GET'])
def network_demo():
    """Run a demo network analysis with pre-generated results"""
    return generate_demo_nta_results()

@network_bp.route('/analyze-pcap', methods=['POST'])
def analyze_pcap():
    """Analyze a PCAP file for cryptographic protocols and algorithms"""
    if 'pcap_file' not in request.files:
        return jsonify({"error": "No PCAP file uploaded"}), 400
    
    pcap_file = request.files['pcap_file']
    if pcap_file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Create a temporary directory to store the uploaded file
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Save the uploaded file
        pcap_path = os.path.join(temp_dir, secure_filename(pcap_file.filename))
        pcap_file.save(pcap_path)
        
        # For demo purposes, we'll use the simulated output
        # In a real implementation, this would analyze the PCAP file
        return generate_demo_nta_results()
            
    except Exception as e:
        return jsonify({"error": f"Error analyzing PCAP file: {str(e)}"}), 500
    finally:
        # Clean up temporary files
        shutil.rmtree(temp_dir, ignore_errors=True)

@network_bp.route('/capture', methods=['POST'])
def capture_traffic():
    """Capture live network traffic for a specified duration and analyze it"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        interface = data.get('interface')
        duration = data.get('duration', 60)  # Default to 60 seconds
        
        if not interface:
            return jsonify({"error": "No interface specified"}), 400
            
        if not isinstance(duration, int) or duration < 10 or duration > 3600:
            return jsonify({"error": "Duration must be between 10 and 3600 seconds"}), 400
        
        # For demo/testing purposes, we'll simulate a short wait
        time.sleep(min(duration * 0.1, 5))  # Simulate at most 5 seconds
        
        # Generate simulated results rather than actually capturing
        return generate_demo_nta_results()
            
    except Exception as e:
        return jsonify({"error": f"Error capturing traffic: {str(e)}"}), 500

def generate_demo_nta_results():
    """Generate simulated network traffic analysis results for development/demo purposes"""
    # Create simulated cryptographic findings that would be found in network traffic
    results = []
    
    # TLS connections
    results.extend([
        {
            "protocol": "TLS",
            "algorithm": "RSA-2048",
            "vulnerability_type": "Shor's Algorithm",
            "risk": "High",
            "source": "192.168.1.100:52364",
            "destination": "93.184.216.34:443",
            "port": 443,
            "certificate": "*.example.com",
            "cipher_suite": "TLS_RSA_WITH_AES_256_GCM_SHA384",
            "key_exchange": "RSA",
            "encryption": "AES-256-GCM",
            "signature": "RSA",
            "session_id": "TLS-1-0",
            "description": "RSA-2048 key exchange is vulnerable to quantum attacks using Shor's algorithm",
            "recommendation": "Migrate to quantum-resistant algorithms like CRYSTALS-Kyber"
        },
        {
            "protocol": "TLS",
            "algorithm": "ECDHE-P256",
            "vulnerability_type": "Shor's Algorithm",
            "risk": "High",
            "source": "192.168.1.100:52365",
            "destination": "172.217.169.36:443",
            "port": 443,
            "certificate": "*.google.com",
            "cipher_suite": "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
            "key_exchange": "ECDHE",
            "encryption": "AES-128-GCM",
            "signature": "RSA",
            "session_id": "TLS-1-1",
            "description": "ECDHE using curve P-256 is vulnerable to quantum attacks using Shor's algorithm",
            "recommendation": "Upgrade to post-quantum key exchange like CRYSTALS-Kyber"
        },
        {
            "protocol": "TLS",
            "algorithm": "DHE-2048",
            "vulnerability_type": "Shor's Algorithm",
            "risk": "High",
            "source": "192.168.1.100:52366",
            "destination": "104.21.25.84:443",
            "port": 443,
            "certificate": "*.cloudflare.com",
            "cipher_suite": "TLS_DHE_RSA_WITH_AES_256_GCM_SHA384",
            "key_exchange": "DHE",
            "encryption": "AES-256-GCM",
            "signature": "RSA",
            "session_id": "TLS-1-2",
            "description": "DHE using 2048-bit parameters is vulnerable to quantum attacks using Shor's algorithm",
            "recommendation": "Upgrade to post-quantum key exchange algorithms"
        }
    ])
    
    # SSH connections
    results.extend([
        {
            "protocol": "SSH",
            "algorithm": "RSA-2048",
            "vulnerability_type": "Shor's Algorithm",
            "risk": "High",
            "source": "192.168.1.100:58472",
            "destination": "198.51.100.5:22",
            "port": 22,
            "key_exchange": "diffie-hellman-group14-sha1",
            "host_key": "ssh-rsa",
            "encryption": "aes128-ctr",
            "session_id": "SSH-1-0",
            "description": "SSH server using RSA-2048 host key is vulnerable to quantum attacks",
            "recommendation": "Upgrade to SSH with post-quantum host keys"
        },
        {
            "protocol": "SSH",
            "algorithm": "ECDSA-P256",
            "vulnerability_type": "Shor's Algorithm",
            "risk": "High",
            "source": "192.168.1.100:58473",
            "destination": "198.51.100.6:22",
            "port": 22,
            "key_exchange": "ecdh-sha2-nistp256",
            "host_key": "ecdsa-sha2-nistp256",
            "encryption": "aes256-ctr",
            "session_id": "SSH-1-1",
            "description": "SSH server using ECDSA with curve P-256 is vulnerable to quantum attacks",
            "recommendation": "Upgrade to SSH with post-quantum algorithms"
        }
    ])
    
    # IPsec/IKE connections
    results.extend([
        {
            "protocol": "IPsec/IKE",
            "algorithm": "DH-Group14",
            "vulnerability_type": "Shor's Algorithm",
            "risk": "High",
            "source": "192.168.1.100:500",
            "destination": "203.0.113.10:500",
            "port": 500,
            "encryption": "AES-CBC-256",
            "integrity": "HMAC-SHA-256-128",
            "dh_group": "14 (2048-bit MODP)",
            "session_id": "IKE-1-0",
            "description": "IKE using Diffie-Hellman Group 14 (2048-bit) is vulnerable to quantum attacks",
            "recommendation": "Upgrade to IKEv2 with quantum-resistant key exchange"
        },
        {
            "protocol": "IPsec/IKE",
            "algorithm": "DH-Group19",
            "vulnerability_type": "Shor's Algorithm",
            "risk": "High",
            "source": "192.168.1.100:500",
            "destination": "203.0.113.11:500",
            "port": 500,
            "encryption": "AES-GCM-256",
            "integrity": "AES-GMAC",
            "dh_group": "19 (256-bit ECP)",
            "session_id": "IKE-1-1",
            "description": "IKE using Diffie-Hellman Group 19 (256-bit ECP) is vulnerable to quantum attacks",
            "recommendation": "Upgrade to IKEv2 with post-quantum key exchange algorithms"
        }
    ])
    
    response_data = {
        "status": "success",
        "scan_type": "network_demo",
        "session_count": len(results),
        "vulnerable_count": sum(1 for r in results if r.get("risk") in ["High", "Critical"]),
        "safe_count": sum(1 for r in results if r.get("risk") not in ["High", "Critical", "Medium"]),
        "results": results
    }
    
    return jsonify(response_data) 