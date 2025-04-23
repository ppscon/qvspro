#!/usr/bin/env python3
# Example file demonstrating RSA encryption and digital signatures
# Note: RSA is vulnerable to quantum attacks due to Shor's algorithm

import os
import time
import base64
import binascii
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.serialization import load_pem_private_key, load_pem_public_key


def generate_rsa_keypair(key_size=2048):
    """
    Generate an RSA key pair with the specified key size
    
    Args:
        key_size: Size of the key in bits (2048, 3072, or 4096 recommended)
        
    Returns:
        tuple: (private_key, public_key)
    """
    # Generate a private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,  # Commonly used value for e
        key_size=key_size
    )
    
    # Extract the public key from the private key
    public_key = private_key.public_key()
    
    return private_key, public_key


def serialize_rsa_private_key(private_key, password=None):
    """
    Serialize a private key to PEM format
    
    Args:
        private_key: RSA private key
        password: Optional password for encryption
        
    Returns:
        bytes: PEM encoded private key
    """
    encryption = None
    if password:
        if isinstance(password, str):
            password = password.encode('utf-8')
        encryption = serialization.BestAvailableEncryption(password)
    
    return private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=encryption or serialization.NoEncryption()
    )


def serialize_rsa_public_key(public_key):
    """
    Serialize a public key to PEM format
    
    Args:
        public_key: RSA public key
        
    Returns:
        bytes: PEM encoded public key
    """
    return public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )


def load_rsa_private_key(pem_data, password=None):
    """
    Load a private key from PEM encoded data
    
    Args:
        pem_data: PEM encoded private key
        password: Optional password if the key is encrypted
        
    Returns:
        RSAPrivateKey: Loaded private key
    """
    if isinstance(password, str):
        password = password.encode('utf-8')
    
    return load_pem_private_key(pem_data, password)


def load_rsa_public_key(pem_data):
    """
    Load a public key from PEM encoded data
    
    Args:
        pem_data: PEM encoded public key
        
    Returns:
        RSAPublicKey: Loaded public key
    """
    return load_pem_public_key(pem_data)


def encrypt_with_rsa(public_key, plaintext):
    """
    Encrypt data with an RSA public key using OAEP padding
    
    Args:
        public_key: RSA public key
        plaintext: Data to encrypt
        
    Returns:
        bytes: Encrypted data
    """
    if isinstance(plaintext, str):
        plaintext = plaintext.encode('utf-8')
    
    # RSA can only encrypt data smaller than the key size
    # For 2048-bit keys, max data size is about 190-245 bytes depending on padding
    ciphertext = public_key.encrypt(
        plaintext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    return ciphertext


def decrypt_with_rsa(private_key, ciphertext):
    """
    Decrypt data with an RSA private key
    
    Args:
        private_key: RSA private key
        ciphertext: Data to decrypt
        
    Returns:
        bytes: Decrypted data
    """
    plaintext = private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    return plaintext


def sign_with_rsa(private_key, message):
    """
    Create a digital signature using an RSA private key
    
    Args:
        private_key: RSA private key
        message: Message to sign
        
    Returns:
        bytes: Signature
    """
    if isinstance(message, str):
        message = message.encode('utf-8')
    
    signature = private_key.sign(
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    
    return signature


def verify_rsa_signature(public_key, message, signature):
    """
    Verify a digital signature using an RSA public key
    
    Args:
        public_key: RSA public key
        message: Original message
        signature: Signature to verify
        
    Returns:
        bool: True if signature is valid
    """
    if isinstance(message, str):
        message = message.encode('utf-8')
    
    try:
        public_key.verify(
            signature,
            message,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except Exception:
        return False


def hybrid_encrypt(public_key, plaintext):
    """
    Encrypt data using a hybrid approach (AES + RSA)
    This is commonly used to encrypt large data with asymmetric cryptography
    
    Args:
        public_key: RSA public key
        plaintext: Data to encrypt (can be larger than RSA size limits)
        
    Returns:
        dict: Encrypted data including AES key and IV
    """
    if isinstance(plaintext, str):
        plaintext = plaintext.encode('utf-8')
    
    # Generate a random AES key and IV
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    aes_key = os.urandom(32)  # 256-bit key
    iv = os.urandom(16)
    
    # Encrypt the data with AES
    cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    
    # Pad the data
    from cryptography.hazmat.primitives import padding
    padder = padding.PKCS7(algorithms.AES.block_size).padder()
    padded_data = padder.update(plaintext) + padder.finalize()
    
    # Encrypt with AES
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()
    
    # Encrypt the AES key with RSA
    encrypted_key = encrypt_with_rsa(public_key, aes_key)
    
    return {
        'encrypted_key': base64.b64encode(encrypted_key).decode('utf-8'),
        'iv': base64.b64encode(iv).decode('utf-8'),
        'ciphertext': base64.b64encode(ciphertext).decode('utf-8')
    }


def hybrid_decrypt(private_key, encrypted_data):
    """
    Decrypt data that was encrypted using the hybrid approach
    
    Args:
        private_key: RSA private key
        encrypted_data: Dictionary with encrypted key, IV, and ciphertext
        
    Returns:
        bytes: Decrypted data
    """
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    
    # Decode the base64 data
    encrypted_key = base64.b64decode(encrypted_data['encrypted_key'])
    iv = base64.b64decode(encrypted_data['iv'])
    ciphertext = base64.b64decode(encrypted_data['ciphertext'])
    
    # Decrypt the AES key with RSA
    aes_key = decrypt_with_rsa(private_key, encrypted_key)
    
    # Decrypt the data with AES
    cipher = Cipher(algorithms.AES(aes_key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    
    # Unpad the data
    from cryptography.hazmat.primitives import padding
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()
    
    return plaintext


def benchmark_rsa_operations(key_sizes=[1024, 2048, 3072, 4096]):
    """
    Benchmark RSA operations with different key sizes
    
    Args:
        key_sizes: List of key sizes to test
        
    Returns:
        dict: Benchmark results
    """
    results = {}
    
    test_data = b"Test data for RSA benchmark" * 4  # 112 bytes
    
    for key_size in key_sizes:
        print(f"Benchmarking RSA with {key_size}-bit key...")
        
        # Key generation
        start_time = time.time()
        private_key, public_key = generate_rsa_keypair(key_size)
        key_gen_time = time.time() - start_time
        
        # Encryption
        start_time = time.time()
        ciphertext = encrypt_with_rsa(public_key, test_data)
        encrypt_time = time.time() - start_time
        
        # Decryption
        start_time = time.time()
        decrypt_with_rsa(private_key, ciphertext)
        decrypt_time = time.time() - start_time
        
        # Signing
        start_time = time.time()
        signature = sign_with_rsa(private_key, test_data)
        sign_time = time.time() - start_time
        
        # Verification
        start_time = time.time()
        verify_rsa_signature(public_key, test_data, signature)
        verify_time = time.time() - start_time
        
        results[key_size] = {
            'key_generation': key_gen_time,
            'encryption': encrypt_time,
            'decryption': decrypt_time,
            'signing': sign_time,
            'verification': verify_time
        }
    
    return results


def demonstrate_basic_rsa():
    """
    Demonstrate basic RSA encryption, decryption, signing and verification
    """
    print("\n=== Basic RSA Encryption and Decryption ===")
    
    # Generate a key pair
    print("Generating a 2048-bit RSA key pair...")
    private_key, public_key = generate_rsa_keypair(2048)
    
    # Original message
    message = "This is a secret message that will be encrypted with RSA."
    print(f"Original message: '{message}'")
    
    # Encrypt the message
    print("Encrypting with public key...")
    ciphertext = encrypt_with_rsa(public_key, message)
    print(f"Ciphertext (first 16 bytes, hex): {binascii.hexlify(ciphertext[:16]).decode('utf-8')}...")
    
    # Decrypt the message
    print("Decrypting with private key...")
    decrypted = decrypt_with_rsa(private_key, ciphertext)
    print(f"Decrypted message: '{decrypted.decode('utf-8')}'")
    
    print("\n=== RSA Digital Signatures ===")
    
    # Sign a message
    document = "This document needs to be cryptographically signed to verify its authenticity."
    print(f"Document to sign: '{document}'")
    
    print("Creating digital signature...")
    signature = sign_with_rsa(private_key, document)
    print(f"Signature (first 16 bytes, hex): {binascii.hexlify(signature[:16]).decode('utf-8')}...")
    
    # Verify the signature
    print("Verifying signature...")
    is_valid = verify_rsa_signature(public_key, document, signature)
    print(f"Signature valid: {is_valid}")
    
    # Demonstrate signature validation with tampered message
    tampered_document = document + " This text was added after signing."
    print(f"\nAttempting to verify signature with tampered document...")
    is_valid = verify_rsa_signature(public_key, tampered_document, signature)
    print(f"Signature valid for tampered document: {is_valid} (expected: False)")
    
    return private_key, public_key


def demonstrate_key_serialization():
    """
    Demonstrate RSA key serialization and loading
    """
    print("\n=== RSA Key Serialization and Loading ===")
    
    # Generate a key pair
    private_key, public_key = generate_rsa_keypair(2048)
    
    # Serialize the keys
    private_pem = serialize_rsa_private_key(private_key)
    public_pem = serialize_rsa_public_key(public_key)
    
    print("Private key (PEM format, first few lines):")
    print("\n".join(private_pem.decode('utf-8').split('\n')[:3]) + "\n...")
    
    print("\nPublic key (PEM format):")
    print(public_pem.decode('utf-8'))
    
    # Serialize with password protection
    password = "secure-password-123"
    encrypted_private_pem = serialize_rsa_private_key(private_key, password)
    
    print("\nPassword-protected private key (first few lines):")
    print("\n".join(encrypted_private_pem.decode('utf-8').split('\n')[:3]) + "\n...")
    
    # Load the keys back
    loaded_private_key = load_rsa_private_key(private_pem)
    loaded_public_key = load_rsa_public_key(public_pem)
    loaded_encrypted_private_key = load_rsa_private_key(encrypted_private_pem, password)
    
    print("\nSuccessfully loaded all keys from PEM format")
    
    # Test the loaded keys
    message = "Testing loaded keys"
    ciphertext = encrypt_with_rsa(loaded_public_key, message)
    decrypted = decrypt_with_rsa(loaded_private_key, ciphertext)
    
    print(f"Encryption/decryption with loaded keys successful: {decrypted.decode('utf-8') == message}")
    
    return private_pem, public_pem


def demonstrate_hybrid_encryption():
    """
    Demonstrate hybrid encryption (RSA + AES) for large data
    """
    print("\n=== Hybrid Encryption (RSA + AES) ===")
    
    # Generate a key pair
    private_key, public_key = generate_rsa_keypair(2048)
    
    # Create a larger message that exceeds RSA size limits
    large_message = "This is a much larger message that exceeds the size limit of what RSA can encrypt directly. " * 20
    print(f"Original message size: {len(large_message)} bytes")
    print(f"Message preview: '{large_message[:60]}...'")
    
    # Encrypt with hybrid approach
    print("Encrypting with hybrid RSA+AES approach...")
    start_time = time.time()
    encrypted_data = hybrid_encrypt(public_key, large_message)
    encrypt_time = time.time() - start_time
    
    print(f"Encryption time: {encrypt_time:.4f} seconds")
    print(f"Encrypted key size: {len(base64.b64decode(encrypted_data['encrypted_key']))} bytes")
    print(f"Ciphertext size: {len(base64.b64decode(encrypted_data['ciphertext']))} bytes")
    
    # Decrypt
    print("Decrypting hybrid-encrypted data...")
    start_time = time.time()
    decrypted = hybrid_decrypt(private_key, encrypted_data)
    decrypt_time = time.time() - start_time
    
    print(f"Decryption time: {decrypt_time:.4f} seconds")
    print(f"Decrypted message matches original: {decrypted.decode('utf-8') == large_message}")
    
    return encrypted_data


def benchmark_and_report():
    """
    Benchmark RSA operations and report the results
    """
    print("\n=== RSA Performance Benchmarking ===")
    
    results = benchmark_rsa_operations()
    
    print("\nResults (time in seconds):")
    print("-" * 85)
    print(f"{'Key Size':<10} {'Key Gen':<12} {'Encrypt':<12} {'Decrypt':<12} {'Sign':<12} {'Verify':<12}")
    print("-" * 85)
    
    for key_size in sorted(results.keys()):
        r = results[key_size]
        print(f"{key_size:<10} {r['key_generation']:<12.5f} {r['encryption']:<12.5f} "
              f"{r['decryption']:<12.5f} {r['signing']:<12.5f} {r['verification']:<12.5f}")
    
    print("-" * 85)
    
    print("\nObservations:")
    print("1. RSA operations become significantly slower as key size increases")
    print("2. Key generation and decryption are the most computationally expensive operations")
    print("3. Encryption and verification are relatively faster (use the public key)")
    print("4. For production systems, 2048-bit keys are minimal, with 3072 or 4096 recommended for long-term security")
    print("5. The performance impact of larger keys should be considered for high-throughput applications")
    
    return results


def explain_quantum_vulnerability():
    """
    Explain RSA's vulnerability to quantum computing attacks
    """
    print("\n=== RSA's Vulnerability to Quantum Computing ===")
    print("RSA security relies on the difficulty of factoring large numbers into their prime factors.")
    print("Classical computers can't efficiently solve this problem, making RSA secure today.")
    print()
    print("Quantum Vulnerability:")
    print("1. Shor's algorithm, running on a sufficiently powerful quantum computer,")
    print("   can factor large numbers in polynomial time, breaking RSA encryption")
    print("2. A quantum computer with enough stable qubits could break today's RSA keys")
    print("3. Even 4096-bit RSA keys would not be secure against future quantum computers")
    print()
    print("Timeline and Estimates:")
    print("1. Current quantum computers don't have enough qubits to break RSA")
    print("2. Estimates vary, but many experts predict that quantum computers capable")
    print("   of breaking 2048-bit RSA could be available in 10-20 years")
    print("3. 'Harvest now, decrypt later' attacks are a current concern - adversaries may")
    print("   collect encrypted data now to decrypt when quantum computers become available")
    print()
    print("Post-Quantum Cryptography:")
    print("1. NIST is standardizing quantum-resistant cryptographic algorithms")
    print("2. Leading candidates include lattice-based, hash-based, and code-based cryptography")
    print("3. Organizations should prepare for crypto-agility - the ability to quickly")
    print("   switch cryptographic algorithms when needed")
    print()
    print("Best Practices for Quantum Readiness:")
    print("1. Inventory where and how RSA is used in your systems")
    print("2. Develop a plan for transitioning to post-quantum algorithms")
    print("3. Consider hybrid approaches that combine classical and post-quantum methods")
    print("4. Stay informed about NIST standards and quantum computing developments")
    print("5. For highly sensitive data with long-term security needs, consider")
    print("   implementing quantum-resistant encryption now")


# Main execution
if __name__ == "__main__":
    print("RSA Encryption Examples")
    print("=====================")
    print("RSA is a public-key cryptosystem widely used for secure data")
    print("transmission and digital signatures. It relies on the practical")
    print("difficulty of factoring the product of two large prime numbers.")
    
    # Demonstrate basic RSA operations
    demonstrate_basic_rsa()
    
    # Demonstrate key serialization
    demonstrate_key_serialization()
    
    # Demonstrate hybrid encryption for large data
    demonstrate_hybrid_encryption()
    
    # Benchmark RSA operations
    benchmark_and_report()
    
    # Explain quantum vulnerability
    explain_quantum_vulnerability() 