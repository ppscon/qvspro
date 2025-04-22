# QVS-Pro: Quantum Vulnerability Scanner

A comprehensive tool for scanning and analyzing quantum-vulnerable cryptographic implementations across environments.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://qvspro.app)

## About QVS-Pro

QVS-Pro is designed to help organizations identify and migrate quantum-vulnerable cryptography before quantum threats materialize. It provides:

- 🔍 **Cryptographic Detection**: Identifies quantum-vulnerable algorithms across environments
- 💻 **Multi-Language Support**: Java, Python, Go, C++, JavaScript
- 📊 **Standardized Reporting**: Creates detailed Cryptography Bill of Materials (CBOM)
- 🛡️ **Remediation Guidance**: Maps vulnerable algorithms to NIST PQC recommendations

## Architecture

- **Frontend**: React with TypeScript
- **Backend**: Python Flask API
- **Database**: Supabase
- **Deployment**: Vercel (Frontend) / Docker (API)

## Development Setup

### Prerequisites

- Node.js 14+
- Python 3.9+
- Docker (optional)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd api
pip install -r requirements.txt
python app.py
```

### Using Docker

```bash
docker build -t qvs-pro-api .
docker run -p 5000:5000 qvs-pro-api
```

## Deployment

The application is configured for seamless deployment:

1. **Frontend**: Automatically deployed through Vercel
2. **API**: Deployed using Docker containers

## Documentation

- [User Guide](https://docs.qvspro.app/manual)
- [API Reference](https://docs.qvspro.app/api)
- [Installation Guide](https://docs.qvspro.app/install)

## License

Proprietary - All rights reserved
