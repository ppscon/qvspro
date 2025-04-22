# Network Traffic Analyzer for QVS-Pro

The Network Traffic Analyzer (NTA) component extends QVS-Pro's capabilities by analyzing network traffic for cryptographic protocols and algorithms vulnerable to quantum computing attacks.

## Features

- **PCAP File Analysis**: Upload and analyze packet capture files to identify quantum-vulnerable cryptography
- **Live Network Capture**: Capture and analyze live network traffic for real-time assessment
- **Protocol Support**:
  - TLS (1.0, 1.1, 1.2, 1.3)
  - SSH
  - IPsec/IKE
  - WireGuard
  - OpenVPN
- **Comprehensive Reports**: View cryptographic risks with recommendations for quantum-safe alternatives

## Requirements

### Backend Dependencies

The NTA component requires the following additional Python packages:

- `netifaces`: For cross-platform network interface discovery
- `psutil`: For system information gathering

Optional third-party dependencies (needed for full functionality):

- `tcpdump`: Command-line packet analyzer (for live capture)
- `libpcap`: Packet capture library

### Deployment Considerations

For the full functionality of the Network Traffic Analyzer component:

1. **Permissions**: The application needs sufficient privileges to access network interfaces

   - When running as a web application, you may need to use sudo/administrative privileges
   - Consider using a native desktop application wrapper for better access to system resources

2. **PCAP File Analysis Mode**:

   - Works in all deployment scenarios
   - Recommended for analyzing pre-captured network traces
   - No special permissions required

3. **Live Capture Mode**:
   - Requires appropriate system permissions
   - May not work in all web hosting environments
   - May require installing tcpdump/WinPcap/Npcap

## Usage Guide

### Analyzing PCAP Files

1. Select "Network Scan" from the scan type options
2. Choose "Upload PCAP File" as the capture method
3. Upload your .pcap or .pcapng file
4. Click "Analyze PCAP"
5. View the results in the Quantum Risk Assessment dashboard

### Live Network Capture

1. Select "Network Scan" from the scan type options
2. Choose "Live Capture" as the capture method
3. Select the network interface to monitor
4. Set the capture duration (10-3600 seconds)
5. Click "Start Capture & Analysis"
6. Wait for the capture to complete and analysis to process
7. Review the results in the Quantum Risk Assessment dashboard

## Understanding the Results

The Network Traffic Analyzer examines cryptographic handshakes and certificate exchanges to identify:

- **High Risk**: Algorithms vulnerable to Shor's algorithm (e.g., RSA, ECDSA)
- **Medium Risk**: Algorithms potentially vulnerable to future quantum advances
- **Low Risk**: Symmetric algorithms requiring key size increases (e.g., AES)
- **No Risk**: Post-quantum cryptographic algorithms (e.g., CRYSTALS-Kyber)

Each finding includes:

- Protocol details
- Cryptographic algorithms used
- Risk level assessment
- Specific recommendations for mitigation

## Development Notes

The NTA component has been designed with a modular architecture to support future extensions:

- `NetworkTrafficAnalyzer.tsx`: UI component for configuring and displaying results
- `network_routes.py`: Backend API endpoints for handling network analysis requests
- Live capture functionality relies on system-level tools like tcpdump
- PCAP analysis is performed by the specialized `qvs-pro-nta` analyzer

## Limitations

- Live capture functionality may not be available in all deployment environments
- Deep packet inspection capabilities may be limited by encryption
- Detailed TLS 1.3 analysis is limited as most handshake information is encrypted
- Capturing on high-speed network interfaces may require specialized hardware
