# QVS-Pro: Quantum Vulnerability Scanner Pro

QVS-Pro is an advanced tool for scanning codebases and identifying cryptographic algorithms potentially vulnerable to quantum computing attacks.

## Project Structure

- `/scanner` - Go-based scanning engine
- `/api` - Python Flask API layer
- `/frontend` - React-based user interface
- `/scripts` - Utility scripts for development and deployment

## Getting Started

### Prerequisites

- Go 1.17+
- Python 3.8+
- Node.js 14+
- npm 6+

### Setup

1. Install Go dependencies:
   ```
   cd scanner
   go mod tidy
   ```

2. Install Python dependencies:
   ```
   cd api
   pip install -r requirements.txt
   ```

3. Install React dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Development Environment

Use the development script:
```
./scripts/dev.sh
```

## Architecture

QVS-Pro uses a three-tier architecture:
- The Go scanner provides high-performance code analysis
- The Python Flask API coordinates between frontend and scanner
- The React frontend delivers a responsive, elegant user experience with dark/light mode support

## License

MIT
