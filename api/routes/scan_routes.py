from flask import Blueprint, request, jsonify
import os
import tempfile
import shutil
import subprocess
import json
import platform
from werkzeug.utils import secure_filename

scan_bp = Blueprint('scan', __name__)

def get_scanner_path():
    """Get the appropriate scanner binary based on the platform"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    api_dir = os.path.dirname(current_dir)
    project_dir = os.path.dirname(api_dir)
    
    # Check platform and use appropriate binary
    if platform.system() == "Linux":
        scanner_name = "qvs-pro-linux"
    else:
        scanner_name = "qvs-pro"
    
    scanner_path = os.path.join(project_dir, 'scanner', scanner_name)
    print(f"Using scanner at: {scanner_path} for platform {platform.system()}")
    
    # If Linux binary doesn't exist but regular does, try to copy and make executable
    if platform.system() == "Linux" and not os.path.exists(scanner_path):
        original_scanner = os.path.join(project_dir, 'scanner', 'qvs-pro')
        if os.path.exists(original_scanner):
            try:
                shutil.copy2(original_scanner, scanner_path)
                os.chmod(scanner_path, 0o755)  # Make executable
                print(f"Copied and made executable: {scanner_path}")
            except Exception as e:
                print(f"Error copying scanner: {str(e)}")
    
    return scanner_path

@scan_bp.route('/', methods=['POST'])
def scan_files():
    if 'files[]' not in request.files:
        return jsonify({"error": "No file or directory selected"}), 400

    temp_dir = tempfile.mkdtemp()
    
    try:
        files = request.files.getlist('files[]')
        scanned_files = []
        
        for file in files:
            if file.filename:
                file_path = os.path.join(temp_dir, secure_filename(file.filename))
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                file.save(file_path)
                scanned_files.append(file.filename)
        
        # Get path to scanner executable using platform-aware function
        scanner_path = get_scanner_path()
        
        if not os.path.exists(scanner_path):
            return jsonify({"error": f"Scanner executable not found at {scanner_path}"}), 500
        
        # Run the scanner with JSON output
        scan_type = request.form.get('scan_type', 'file')
        
        if scan_type == 'directory':
            print(f"Running directory scan on {temp_dir}")
            # The scanner doesn't have a -dirr flag, use -dir for all types
            cmd = [scanner_path, '-dir', temp_dir, '-json']
        else:
            print(f"Running file scan on {len(scanned_files)} files")
            cmd = [scanner_path, '-dir', temp_dir, '-json']
            
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            return jsonify({
                "error": f"Scanner exited with code {result.returncode}",
                "details": result.stderr
            }), 500
        
        # Parse JSON output
        try:
            scan_results = json.loads(result.stdout)
            
            # Add summary information
            return jsonify({
                "status": "success",
                "scan_type": scan_type,
                "vulnerabilities_count": len(scan_results),
                "scanned_files": scanned_files,
                "results": scan_results
            })
        except json.JSONDecodeError:
            return jsonify({
                "error": "Failed to parse scanner output",
                "raw_output": result.stdout
            }), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up the temporary directory
        shutil.rmtree(temp_dir)

@scan_bp.route('/status/<scan_id>', methods=['GET'])
def scan_status(scan_id):
    # Future implementation for background scanning
    return jsonify({"status": "not_implemented"})

@scan_bp.route('/demo', methods=['GET'])
def scan_demo():
    # Path to the built-in test directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    api_dir = os.path.dirname(current_dir)
    project_dir = os.path.dirname(api_dir)
    test_dir = os.path.join(project_dir, 'Data', 'qvs_sample_files')
    
    # Use platform-aware scanner path
    scanner_path = get_scanner_path()

    if not os.path.exists(scanner_path):
        return jsonify({"error": f"Scanner executable not found at {scanner_path}"}), 500
    if not os.path.exists(test_dir):
        return jsonify({"error": f"Test directory not found at {test_dir}"}), 500

    # Run the scanner with JSON output on the test directory
    cmd = [scanner_path, '-dir', test_dir, '-json']
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        return jsonify({
            "error": f"Scanner exited with code {result.returncode}",
            "details": result.stderr
        }), 500

    try:
        scan_results = json.loads(result.stdout)
        return jsonify({
            "status": "success",
            "scan_type": "demo",
            "vulnerabilities_count": len(scan_results),
            "scanned_files": os.listdir(test_dir),
            "results": scan_results
        })
    except json.JSONDecodeError:
        return jsonify({
            "error": "Failed to parse scanner output",
            "raw_output": result.stdout
        }), 500
