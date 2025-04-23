#!/usr/bin/env python3

# Python implementation of quantum-vulnerable cryptography
import os
from cryptography.hazmat.primitives.asymmetric import rsa, ec, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend

class QuantumVulnerableCrypto:
    """Example class demonstrating quantum-vulnerable cryptographic methods"""
    
    @staticmethod
    def generate_rsa_keys():
        """Generate RSA key pair - vulnerable to quantum computing"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        public_key = private_key.public_key()
        return private_key, public_key
    
    @staticmethod
    def encrypt_with_rsa(public_key, message):
        """Encrypt using RSA - vulnerable to quantum computing"""
        ciphertext = public_key.encrypt(
            message,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return ciphertext
    
    @staticmethod
    def generate_aes_key():
        """Generate AES-128 key - potentially vulnerable"""
        key_128 = os.urandom(16)  # 128 bits key
        return key_128
    
    @staticmethod
    def encrypt_with_aes(key, message):
        """Encrypt using AES-128 in CBC mode"""
        iv = os.urandom(16)
        cipher = Cipher(
            algorithms.AES(key),
            modes.CBC(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        # Pad the message to be a multiple of block size
        padded_message = message + b'\0' * (16 - len(message) % 16)
        ciphertext = encryptor.update(padded_message) + encryptor.finalize()
        return iv, ciphertext
    
    @staticmethod
    def generate_ecc_keys():
        """Generate ECC keys - vulnerable to quantum computing"""
        private_key = ec.generate_private_key(
            curve=ec.SECP256R1(),
            backend=default_backend()
        )
        public_key = private_key.public_key()
        return private_key, public_key
    
    @staticmethod
    def sign_with_ecc(private_key, message):
        """Sign message using ECC - vulnerable to quantum computing"""
        signature = private_key.sign(
            message,
            ec.ECDSA(hashes.SHA256())
        )
        return signature


if __name__ == "__main__":
    # RSA example
    private_key, public_key = QuantumVulnerableCrypto.generate_rsa_keys()
    message = b"Secret message for RSA encryption"
    encrypted = QuantumVulnerableCrypto.encrypt_with_rsa(public_key, message)
    print(f"RSA encrypted data (length: {len(encrypted)} bytes)")
    
    # AES example
    aes_key = QuantumVulnerableCrypto.generate_aes_key()
    message = b"Secret message for AES encryption"
    iv, encrypted = QuantumVulnerableCrypto.encrypt_with_aes(aes_key, message)
    print(f"AES encrypted data (length: {len(encrypted)} bytes)")
    
    # ECC example
    ecc_private, ecc_public = QuantumVulnerableCrypto.generate_ecc_keys()
    message = b"Message for ECC signing"
    signature = QuantumVulnerableCrypto.sign_with_ecc(ecc_private, message)
    print(f"ECC signature created (length: {len(signature)} bytes)") 