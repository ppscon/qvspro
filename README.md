# QVS-Pro: Quantum Vulnerability Scanner

A comprehensive tool for scanning and analyzing quantum-vulnerable cryptographic implementations across environments.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://qvspro.app)

## About QVS-Pro

QVS-Pro is designed to help organizations identify and migrate quantum-vulnerable cryptography before quantum threats materialize. It provides:

- 🔍 **Cryptographic Detection**: Identifies quantum-vulnerable algorithms across environments
- 💻 **Multi-Language Support**: Java, Python, Go, C++, JavaScript
- 📊 **Standardized Reporting**: Creates detailed Cryptography Bill of Materials (CBOM)
- 🛡️ **Remediation Guidance**: Maps vulnerable algorithms to NIST PQC recommendations
- 📄 **Flexible Export Options**: Export results in JSON, CSV, XLSX, and PDF formats

## Architecture

- **Frontend**: React with TypeScript
- **Backend**: Python Flask API
- **Database**: Supabase
- **Deployment**: Vercel (Frontend) / Render (API)

## Features

### CBOM Export and Reporting

QVS-Pro provides comprehensive export and reporting capabilities for Cryptographic Bill of Materials (CBOM):

- **JSON Export**: Raw data export with complete CBOM structure for programmatic use
- **CSV Export**: Simplified tabular format for spreadsheet analysis
- **Excel (XLSX) Export**: Multi-sheet workbook with summary statistics, component details, and asset inventory
- **PDF Reports**: Professionally formatted assessment reports with executive summary, risk analysis, and remediation recommendations

#### XLSX Export Structure

The Excel export includes multiple sheets:

1. **Summary**: Overall statistics, risk distribution, and vulnerability breakdown
2. **Components**: List of all cryptographic components with metadata
3. **Assets**: Complete inventory of all cryptographic assets
4. **Critical Assets**: Filtered view of only critical risk assets
5. **High Risk Assets**: Filtered view of high risk assets

#### PDF Report Features

The PDF report includes:

- Executive summary with key findings
- Risk distribution analysis
- Component breakdown and prioritization
- Top vulnerable assets
- Actionable remediation recommendations
- VEX (Vulnerability Exploitability eXchange) status overview

## Development Setup

### Prerequisites

- Node.js 14+
- Python 3.9+
- Docker (optional)

### Frontend

```bash
cd frontend
npm install

# Install required libraries for exports
npm install xlsx

# Create a .env file with the following content:
# REACT_APP_API_URL=http://localhost:5001

npm run dev
```

### Backend

```bash
cd api
pip install -r requirements.txt

# You can set environment variables if needed:
# export PORT=5001  # Default is 5001
# export FLASK_DEBUG=1  # For development

python app.py
```

Note: The backend is configured to allow CORS requests from `http://localhost:3000` and `https://qvspro.app`. If you're running the frontend on a different URL, you'll need to add it to the allowed origins in `api/app.py`.

### Alternative: Using Docker (Local Development)

While the production backend is deployed on Render, you can also use Docker for local development:

```bash
docker build -t qvs-pro-api .
docker run -p 5001:5001 -e PORT=5001 qvs-pro-api
```

Note: Make sure to set the correct port mapping and environment variables when running the Docker container.

## Deployment

The application is deployed and accessible at:

- **Frontend**: [https://qvspro.app](https://qvspro.app) (Deployed on Vercel)
- **Backend API**: [https://qvspro.onrender.com](https://qvspro.onrender.com) (Deployed on Render)

### Deployment Configuration

#### Frontend (Vercel)

- Set the `REACT_APP_API_URL` environment variable to point to the backend API URL
- Configure `vercel.json` for build settings

#### Backend (Render)

- Uses Render's native Python environment with Gunicorn
- Configured to use the `PORT` environment variable provided by Render
- CORS configured to allow requests from the frontend domain
- Go scanner binary is cross-compiled for Linux (GOOS=linux GOARCH=amd64)

## Documentation

- [User Guide](https://docs.qvspro.app/manual)
- [API Reference](https://docs.qvspro.app/api)
- [Installation Guide](https://docs.qvspro.app/install)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Best Practices](docs/SECURITY.md)
- [Maintenance Guide](docs/MAINTENANCE.md)
- [Deployment Summary](docs/SUMMARY.md)

## License

Proprietary - All rights reserved
