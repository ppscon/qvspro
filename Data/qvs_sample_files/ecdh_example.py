#!/usr/bin/env python3
# Example file with ECDH (Elliptic Curve Diffie-Hellman) key exchange
# This is vulnerable to quantum attacks

from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
import os

def generate_ecdh_keypair():
    """Generate an EC keypair using the SECP256R1 curve (NIST P-256)"""
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    return private_key, public_key

def derive_shared_key(private_key, peer_public_key):
    """Derive a shared key using ECDH"""
    shared_key = private_key.exchange(ec.ECDH(), peer_public_key)
    # Derive a key using HKDF
    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b'handshake data'
    ).derive(shared_key)
    return derived_key

# Example of ECDH key exchange between Alice and Bob
if __name__ == "__main__":
    # Alice generates her keypair
    alice_private, alice_public = generate_ecdh_keypair()
    print("Alice has generated her keypair")
    
    # Bob generates his keypair
    bob_private, bob_public = generate_ecdh_keypair()
    print("Bob has generated his keypair")
    
    # Alice and Bob exchange public keys and derive the shared secret
    alice_shared_key = derive_shared_key(alice_private, bob_public)
    bob_shared_key = derive_shared_key(bob_private, alice_public)
    
    # Verify that both derived the same key
    if alice_shared_key == bob_shared_key:
        print("Key exchange successful - Alice and Bob have derived the same shared key")
        print(f"Shared key: {alice_shared_key.hex()}")
    else:
        print("Key exchange failed - derived keys don't match")
    
    # This implementation is vulnerable to quantum attacks
    print("Warning: ECDH key exchange is vulnerable to quantum attacks using Shor's algorithm")
    print("This would be detected by QVS-Pro scanner as a quantum vulnerability") 