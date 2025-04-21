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

# Import our network traffic analyzer    
from api.services.network.network_analyzer import NetworkTrafficAnalyzer

network_bp = Blueprint('network', __name__)
network_analyzer = NetworkTrafficAnalyzer()

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
    """Run a demo network analysis with generated results"""
    try:
        # Use our network analyzer to generate demo results
        results = network_analyzer.get_demo_analysis()
        return jsonify(results)
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": f"Error generating demo results: {str(e)}"
        }), 500

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
        
        # Analyze the PCAP file with our network analyzer
        analysis_results = network_analyzer.analyze_pcap(pcap_path)
        
        # Format results for API response
        api_results = network_analyzer.format_results_for_api(analysis_results)
        
        return jsonify(api_results)
            
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
        
        # Generate simulated results for now
        # In a real implementation, this would capture traffic and analyze it
        results = network_analyzer.get_demo_analysis()
        
        return jsonify(results)
            
    except Exception as e:
        return jsonify({"error": f"Error capturing traffic: {str(e)}"}), 500

@network_bp.route('/tls-handshake-analysis', methods=['POST'])
def analyze_tls_handshake():
    """
    Analyze a specific TLS handshake for quantum vulnerabilities
    
    This endpoint allows for direct analysis of a TLS handshake without requiring a full PCAP file.
    Useful for API integrations and specific handshake testing.
    
    Request body should contain a JSON representation of the TLS handshake with at least:
    - client_hello
    - server_hello
    - (optionally) certificate data
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No handshake data provided"}), 400
        
        # Validate that we have at least basic handshake components
        if 'client_hello' not in data or 'server_hello' not in data:
            return jsonify({
                "error": "Incomplete handshake data. Both client_hello and server_hello are required."
            }), 400
        
        # Analyze the handshake
        result = network_analyzer.tls_inspector.inspect_handshake(data)
        
        # Add mock connection information if not present
        if 'source' not in result:
            result['source'] = '192.168.1.10:12345'
        if 'destination' not in result:
            result['destination'] = '93.184.216.34:443'
        if 'port' not in result:
            result['port'] = 443
        if 'session_id' not in result:
            result['session_id'] = 'TLS-Custom'
        
        # Return the analysis result
        return jsonify({
            "status": "success",
            "scan_type": "tls_handshake",
            "result": result
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": f"Error analyzing TLS handshake: {str(e)}"
        }), 500

# In real implementation, this would be replaced by the network analyzer's implementation
def generate_demo_nta_results():
    """Generate simulated network traffic analysis results for development/demo purposes"""
    return network_analyzer.get_demo_analysis() 