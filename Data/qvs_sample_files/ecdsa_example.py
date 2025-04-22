#!/usr/bin/env python3
# Example file with ECDSA (Elliptic Curve Digital Signature Algorithm)
# This is vulnerable to quantum attacks via Shor's algorithm

from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
import base64
import os

def generate_ecdsa_keypair(curve=ec.SECP256R1()):
    """Generate an ECDSA key pair using the specified elliptic curve"""
    # Generate a private key
    private_key = ec.generate_private_key(curve)
    
    # Extract the public key
    public_key = private_key.public_key()
    
    return private_key, public_key

def sign_message(private_key, message):
    """Sign a message using ECDSA"""
    signature = private_key.sign(
        message.encode(),
        ec.ECDSA(hashes.SHA256())
    )
    return base64.b64encode(signature).decode('utf-8')

def verify_signature(public_key, message, signature):
    """Verify an ECDSA signature"""
    try:
        public_key.verify(
            base64.b64decode(signature.encode('utf-8')),
            message.encode(),
            ec.ECDSA(hashes.SHA256())
        )
        return True
    except Exception:
        return False

def print_key_info(private_key, public_key):
    """Print information about the ECDSA keys"""
    # Get curve information
    curve = private_key.curve
    
    # Get public key in PEM format
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    # Print key information
    print(f"ECDSA curve: {curve.name}")
    print(f"Public key (PEM format):\n{public_pem.decode()}")

# Example of ECDSA signing and verification
if __name__ == "__main__":
    # Generate ECDSA key pair
    private_key, public_key = generate_ecdsa_keypair()
    print_key_info(private_key, public_key)
    
    # Original message
    message = "This message will be signed with ECDSA"
    print(f"Original message: {message}")
    
    # Sign the message
    signature = sign_message(private_key, message)
    print(f"Signature: {signature}")
    
    # Verify the signature
    verification_result = verify_signature(public_key, message, signature)
    print(f"Signature verification: {'Success' if verification_result else 'Failed'}")
    
    # Try to verify with a tampered message
    tampered_message = message + " (tampered)"
    tampered_verification = verify_signature(public_key, tampered_message, signature)
    print(f"Tampered message verification: {'Success' if tampered_verification else 'Failed'}")
    
    # Quantum vulnerability warning
    print("\nWARNING: ECDSA is vulnerable to quantum attacks!")
    print("Shor's algorithm, when run on a sufficiently powerful quantum computer,")
    print("can efficiently solve the discrete logarithm problem on elliptic curves,")
    print("breaking ECDSA signatures.")
    print("This code should NOT be used in applications that need to be")
    print("secure against quantum attacks in the future.") 