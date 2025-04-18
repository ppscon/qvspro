from flask import Flask, request, jsonify, send_from_directory
import os
import tempfile
import shutil
import subprocess
import json
from werkzeug.utils import secure_filename
from flask_cors import CORS

# Import route modules
from routes.scan_routes import scan_bp

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app)

# Register blueprints
app.register_blueprint(scan_bp, url_prefix='/api/scan')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5001)
