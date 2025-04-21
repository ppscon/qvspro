from flask import Flask, request, jsonify, send_from_directory
import os
import tempfile
import shutil
import subprocess
import json
from werkzeug.utils import secure_filename
from flask_cors import CORS
import sys

# Create a mock netifaces module to handle the import error
class MockNetifaces:
    def interfaces(self):
        return ["eth0", "wlan0"]  # Mock network interfaces

# Add the mock to sys.modules if netifaces isn't available
try:
    import netifaces
except ImportError:
    sys.modules['netifaces'] = MockNetifaces()

# Import route modules
from routes.scan_routes import scan_bp
from routes.network_routes import network_bp

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app)

# Configure Flask to avoid "Too many open files" error
if os.environ.get('FLASK_DEBUG') == '1':
    extra_dirs = ['routes', 'utils', 'templates']
    extra_files = []
    for extra_dir in extra_dirs:
        for dirname, dirs, files in os.walk(extra_dir):
            if 'node_modules' in dirname or '__pycache__' in dirname or '.git' in dirname:
                continue
            for filename in files:
                filename = os.path.join(dirname, filename)
                if os.path.isfile(filename):
                    extra_files.append(filename)

# Register blueprints
app.register_blueprint(scan_bp, url_prefix='/api/scan')
app.register_blueprint(network_bp, url_prefix='/api/network')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Run without debug mode to avoid "Too many open files" error
    app.run(debug=False, port=5001, host='0.0.0.0', 
           extra_files=None if os.environ.get('FLASK_DEBUG') != '1' else extra_files)
