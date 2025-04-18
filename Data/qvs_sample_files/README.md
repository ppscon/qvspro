# Test Data for QVS-Pro

This directory contains sample files with quantum-vulnerable cryptographic implementations for testing the QVS-Pro scanner.

## Sample Files

1. **sample_java.java** - Java implementation of RSA, AES-128, and ECC
2. **sample_python.py** - Python implementation using the cryptography library
3. **sample_cpp.cpp** - C++ implementation using OpenSSL
4. **test_crypto.js** - JavaScript implementation using Node.js crypto module

## Expected Vulnerabilities

The files contain the following types of quantum-vulnerable cryptography:

| Algorithm | Risk Level | Description                                         |
| --------- | ---------- | --------------------------------------------------- |
| RSA       | High       | Vulnerable to Shor's algorithm on quantum computers |
| ECC       | High       | Vulnerable to quantum attacks                       |
| AES-128   | Medium     | Potentially vulnerable to Grover's algorithm        |

## Usage

To test these files with QVS-Pro:

1. Upload these files through the web interface
2. Scan them using the "Start Scan" button
3. Review the vulnerability report

## Adding More Test Files

Feel free to add more test files with different programming languages or cryptographic implementations. The scanner is designed to detect patterns across many languages.
