#!/usr/bin/env python3
# Example file demonstrating Elliptic Curve Cryptography (ECC)
# Note: ECC is vulnerable to quantum attacks via Shor's algorithm

import os
import time
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


def generate_ecc_keypair(curve=ec.SECP256R1()):
    """
    Generate an ECC key pair using the specified curve
    
    Args:
        curve: The elliptic curve to use (default is SECP256R1/P-256)
        
    Returns:
        tuple: (private_key, public_key, generation_time)
    """
    start_time = time.time()
    
    # Generate a private key
    private_key = ec.generate_private_key(curve)
    
    # Extract the public key
    public_key = private_key.public_key()
    
    generation_time = time.time() - start_time
    
    return private_key, public_key, generation_time


def get_curve_name(curve):
    """
    Get a human-readable name for an elliptic curve
    
    Args:
        curve: An EC curve object
        
    Returns:
        str: Human-readable curve name
    """
    curve_map = {
        ec.SECP256R1: "NIST P-256",
        ec.SECP384R1: "NIST P-384",
        ec.SECP521R1: "NIST P-521",
        ec.SECP256K1: "secp256k1 (used in Bitcoin)",
        ec.SECT283K1: "NIST K-283",
        ec.SECT283R1: "NIST B-283",
        ec.SECT409K1: "NIST K-409",
        ec.SECT409R1: "NIST B-409",
        ec.SECT571K1: "NIST K-571",
        ec.SECT571R1: "NIST B-571"
    }
    
    for curve_class, name in curve_map.items():
        if isinstance(curve, curve_class):
            return name
    
    return "Unknown curve"


def serialize_ecc_public_key(public_key, format="PEM"):
    """
    Serialize an ECC public key to PEM or DER format
    
    Args:
        public_key: ECC public key
        format: Output format (PEM or DER)
        
    Returns:
        bytes: Serialized public key
    """
    if format.upper() == "PEM":
        return public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
    elif format.upper() == "DER":
        return public_key.public_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
    else:
        raise ValueError("Format must be PEM or DER")


def serialize_ecc_private_key(private_key, password=None, format="PEM"):
    """
    Serialize an ECC private key to PEM or DER format, optionally with password protection
    
    Args:
        private_key: ECC private key
        password: Password for encryption (None for no encryption)
        format: Output format (PEM or DER)
        
    Returns:
        bytes: Serialized private key
    """
    # Determine encryption algorithm based on password
    if password is not None:
        if isinstance(password, str):
            password = password.encode('utf-8')
        encryption_algorithm = serialization.BestAvailableEncryption(password)
    else:
        encryption_algorithm = serialization.NoEncryption()
    
    # Serialize the key
    if format.upper() == "PEM":
        return private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=encryption_algorithm
        )
    elif format.upper() == "DER":
        return private_key.private_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=encryption_algorithm
        )
    else:
        raise ValueError("Format must be PEM or DER")


def load_ecc_public_key(serialized_key):
    """
    Load an ECC public key from its serialized form
    
    Args:
        serialized_key: Serialized public key (PEM or DER)
        
    Returns:
        ECC public key object
    """
    return serialization.load_pem_public_key(serialized_key)


def load_ecc_private_key(serialized_key, password=None):
    """
    Load an ECC private key from its serialized form
    
    Args:
        serialized_key: Serialized private key (PEM or DER)
        password: Password if the key is encrypted
        
    Returns:
        ECC private key object
    """
    if password is not None and isinstance(password, str):
        password = password.encode('utf-8')
    
    return serialization.load_pem_private_key(serialized_key, password=password)


def sign_message_with_ecc(private_key, message):
    """
    Sign a message using ECC
    
    Args:
        private_key: ECC private key
        message: Message to sign
        
    Returns:
        bytes: Signature
    """
    if isinstance(message, str):
        message = message.encode('utf-8')
    
    signature = private_key.sign(
        message,
        ec.ECDSA(hashes.SHA256())
    )
    
    return signature


def verify_ecc_signature(public_key, message, signature):
    """
    Verify an ECC signature
    
    Args:
        public_key: ECC public key
        message: The original message
        signature: The signature to verify
        
    Returns:
        bool: True if verification succeeded, False otherwise
    """
    if isinstance(message, str):
        message = message.encode('utf-8')
    
    try:
        public_key.verify(
            signature,
            message,
            ec.ECDSA(hashes.SHA256())
        )
        return True
    except Exception:
        return False


def perform_ecdh_key_exchange(private_key, peer_public_key):
    """
    Perform Elliptic Curve Diffie-Hellman (ECDH) key exchange
    
    Args:
        private_key: Your ECC private key
        peer_public_key: The peer's ECC public key
        
    Returns:
        bytes: Shared key material
    """
    shared_key = private_key.exchange(ec.ECDH(), peer_public_key)
    return shared_key


def derive_encryption_key(shared_key, salt=None, info=None):
    """
    Derive an encryption key from ECDH shared key material
    
    Args:
        shared_key: Shared key material from ECDH exchange
        salt: Optional salt for the KDF
        info: Optional context info for the KDF
        
    Returns:
        bytes: Derived encryption key
    """
    if salt is None:
        salt = os.urandom(16)
    
    if info is None:
        info = b"ECDH Encryption Key"
    
    # Derive a 32-byte (256-bit) key using HKDF
    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        info=info
    ).derive(shared_key)
    
    return derived_key, salt


def encrypt_with_derived_key(key, plaintext):
    """
    Encrypt data using a key derived from ECDH
    
    Args:
        key: Derived encryption key
        plaintext: Data to encrypt
        
    Returns:
        dict: Contains IV, ciphertext, and tag
    """
    if isinstance(plaintext, str):
        plaintext = plaintext.encode('utf-8')
    
    # Generate a random IV
    iv = os.urandom(12)  # 96 bits for GCM
    
    # Create an encryptor object
    cipher = Cipher(algorithms.AES(key), modes.GCM(iv))
    encryptor = cipher.encryptor()
    
    # Encrypt the plaintext
    ciphertext = encryptor.update(plaintext) + encryptor.finalize()
    
    # Return everything needed for decryption
    return {
        'iv': base64.b64encode(iv).decode('utf-8'),
        'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
        'tag': base64.b64encode(encryptor.tag).decode('utf-8')
    }


def decrypt_with_derived_key(key, encrypted_data):
    """
    Decrypt data using a key derived from ECDH
    
    Args:
        key: Derived encryption key
        encrypted_data: Dictionary with IV, ciphertext, and tag
        
    Returns:
        bytes: Decrypted data
    """
    # Decode base64 data
    iv = base64.b64decode(encrypted_data['iv'])
    ciphertext = base64.b64decode(encrypted_data['ciphertext'])
    tag = base64.b64decode(encrypted_data['tag'])
    
    # Create a decryptor object
    cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag))
    decryptor = cipher.decryptor()
    
    # Decrypt the ciphertext
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    
    return plaintext


def benchmark_ecc_operations(curves=[ec.SECP256R1(), ec.SECP384R1(), ec.SECP521R1()]):
    """
    Benchmark ECC operations with different curves
    
    Args:
        curves: List of EC curves to benchmark
        
    Returns:
        dict: Benchmark results
    """
    results = {}
    
    # Test message
    message = b"This is a test message for ECC benchmarking"
    
    for curve in curves:
        curve_name = get_curve_name(curve)
        key_results = {}
        
        # Key generation
        private_key, public_key, gen_time = generate_ecc_keypair(curve)
        key_results['key_generation'] = gen_time
        
        # Signing
        start_time = time.time()
        signature = sign_message_with_ecc(private_key, message)
        key_results['signing'] = time.time() - start_time
        
        # Verification
        start_time = time.time()
        verify_ecc_signature(public_key, message, signature)
        key_results['verification'] = time.time() - start_time
        
        # ECDH key exchange
        alice_private, alice_public, _ = generate_ecc_keypair(curve)
        bob_private, bob_public, _ = generate_ecc_keypair(curve)
        
        start_time = time.time()
        alice_shared = perform_ecdh_key_exchange(alice_private, bob_public)
        key_results['key_exchange'] = time.time() - start_time
        
        # Key derivation
        start_time = time.time()
        derived_key, _ = derive_encryption_key(alice_shared)
        key_results['key_derivation'] = time.time() - start_time
        
        results[curve_name] = key_results
    
    return results


def demonstrate_basic_ecc():
    """
    Demonstrate basic ECC operations
    """
    print("\n=== Basic ECC Demonstration ===")
    
    # Generate a key pair
    private_key, public_key, gen_time = generate_ecc_keypair()
    curve_name = get_curve_name(private_key.curve)
    print(f"Generated {curve_name} key pair in {gen_time:.4f} seconds")
    
    # Original message
    message = "This is a message that will be signed with ECC"
    print(f"Original message: '{message}'")
    
    # Sign the message
    signature = sign_message_with_ecc(private_key, message)
    print(f"Signature (base64): {base64.b64encode(signature).decode('utf-8')[:40]}...")
    
    # Verify the signature
    verification = verify_ecc_signature(public_key, message, signature)
    print(f"Signature verification: {'Successful' if verification else 'Failed'}")
    
    # Try to verify with a tampered message
    tampered_message = message + " (tampered)"
    verification = verify_ecc_signature(public_key, tampered_message, signature)
    print(f"Tampered message verification: {'Successful' if verification else 'Failed (expected)'}")
    
    return True


def demonstrate_ecdh_exchange():
    """
    Demonstrate Elliptic Curve Diffie-Hellman (ECDH) key exchange
    """
    print("\n=== ECDH Key Exchange Demonstration ===")
    
    # Generate keys for Alice and Bob
    alice_private, alice_public, _ = generate_ecc_keypair()
    bob_private, bob_public, _ = generate_ecc_keypair()
    
    print("Alice and Bob each generate their own key pairs")
    print("They keep their private keys secret and exchange public keys")
    
    # Perform key exchange
    print("\nAlice computes shared secret using her private key and Bob's public key")
    alice_shared = perform_ecdh_key_exchange(alice_private, bob_public)
    
    print("Bob computes shared secret using his private key and Alice's public key")
    bob_shared = perform_ecdh_key_exchange(bob_private, alice_public)
    
    # Verify that both parties have the same shared secret
    print("\nVerifying that Alice and Bob derived the same shared secret...")
    if alice_shared == bob_shared:
        print("Success! Both parties have derived the identical shared secret")
        print(f"Shared secret (first 16 bytes, base64): {base64.b64encode(alice_shared[:16]).decode('utf-8')}")
    else:
        print("Error: The shared secrets do not match!")
    
    # Derive encryption keys
    print("\nDeriving encryption keys from the shared secret...")
    salt = os.urandom(16)
    alice_key, _ = derive_encryption_key(alice_shared, salt)
    bob_key, _ = derive_encryption_key(bob_shared, salt)
    
    print(f"Derived key (first 16 bytes, base64): {base64.b64encode(alice_key[:16]).decode('utf-8')}")
    
    # Demonstrate encryption and decryption
    message = "This is a secret message from Alice to Bob"
    print(f"\nOriginal message from Alice: '{message}'")
    
    # Alice encrypts a message for Bob
    encrypted = encrypt_with_derived_key(alice_key, message)
    print("Alice encrypts the message using her derived key")
    print(f"Encrypted (truncated): {encrypted['ciphertext'][:40]}...")
    
    # Bob decrypts the message from Alice
    decrypted = decrypt_with_derived_key(bob_key, encrypted)
    print("\nBob decrypts the message using his derived key")
    print(f"Decrypted message: '{decrypted.decode('utf-8')}'")
    
    return alice_shared == bob_shared


def demonstrate_key_serialization():
    """
    Demonstrate ECC key serialization and loading
    """
    print("\n=== ECC Key Serialization Demonstration ===")
    
    # Generate a key pair
    private_key, public_key, _ = generate_ecc_keypair()
    curve_name = get_curve_name(private_key.curve)
    
    # Serialize the public key
    serialized_public = serialize_ecc_public_key(public_key)
    print(f"Serialized {curve_name} public key (PEM):\n{serialized_public.decode('utf-8')[:150]}...")
    
    # Serialize the private key without encryption
    serialized_private = serialize_ecc_private_key(private_key)
    print(f"Serialized private key (PEM, unencrypted):\n{serialized_private.decode('utf-8')[:150]}...")
    
    # Serialize the private key with password protection
    password = "secure-password-123"
    serialized_private_encrypted = serialize_ecc_private_key(private_key, password)
    print(f"Serialized private key (PEM, encrypted):\n{serialized_private_encrypted.decode('utf-8')[:150]}...")
    
    # Load the keys back
    loaded_public = load_ecc_public_key(serialized_public)
    loaded_private = load_ecc_private_key(serialized_private)
    loaded_private_encrypted = load_ecc_private_key(serialized_private_encrypted, password)
    
    # Verify that the loaded keys work
    message = "Testing loaded keys"
    
    # Sign with unencrypted key
    signature1 = sign_message_with_ecc(loaded_private, message)
    verify1 = verify_ecc_signature(loaded_public, message, signature1)
    
    # Sign with encrypted key
    signature2 = sign_message_with_ecc(loaded_private_encrypted, message)
    verify2 = verify_ecc_signature(loaded_public, message, signature2)
    
    print(f"Loaded keys test (unencrypted): {'Successful' if verify1 else 'Failed'}")
    print(f"Loaded keys test (encrypted): {'Successful' if verify2 else 'Failed'}")
    
    return verify1 and verify2


def benchmark_and_report():
    """
    Benchmark ECC operations and report the results
    """
    print("\n=== ECC Performance Benchmarking ===")
    print("Benchmarking ECC operations with different curves...")
    
    results = benchmark_ecc_operations([
        ec.SECP256R1(),
        ec.SECP384R1(),
        ec.SECP521R1()
    ])
    
    print("\nResults (time in seconds):")
    print("-" * 80)
    print(f"{'Operation':<20} {'NIST P-256':<15} {'NIST P-384':<15} {'NIST P-521':<15}")
    print("-" * 80)
    
    for operation in ['key_generation', 'signing', 'verification', 'key_exchange', 'key_derivation']:
        print(f"{operation:<20}", end="")
        for curve in ["NIST P-256", "NIST P-384", "NIST P-521"]:
            print(f"{results[curve][operation]:<15.4f}", end="")
        print()
    
    print("-" * 80)
    
    print("\nObservations:")
    print("1. Operations with larger curves take longer but provide more security")
    print("2. Verification is typically faster than signing")
    print("3. Key generation time increases significantly with curve size")
    print("4. ECDH key exchange is relatively efficient across all curves")
    
    return results


# Main execution
if __name__ == "__main__":
    print("Elliptic Curve Cryptography (ECC) Example")
    print("========================================")
    print("ECC is an asymmetric encryption approach that uses the algebraic structure")
    print("of elliptic curves over finite fields for key generation, signatures,")
    print("and key exchange. It provides strong security with smaller key sizes")
    print("compared to RSA.")
    
    # Demonstrate basic ECC operations
    demonstrate_basic_ecc()
    
    # Demonstrate ECDH key exchange
    demonstrate_ecdh_exchange()
    
    # Demonstrate key serialization
    demonstrate_key_serialization()
    
    # Benchmark ECC operations
    benchmark_and_report()
    
    # Information about quantum vulnerability
    print("\n=== Quantum Computing Vulnerability of ECC ===")
    print("ECC security relies on the difficulty of the Elliptic Curve Discrete")
    print("Logarithm Problem (ECDLP), which is hard for classical computers but")
    print("vulnerable to quantum computers using Shor's algorithm.")
    print()
    print("Quantum Vulnerability Details:")
    print("1. Shor's algorithm can solve the ECDLP in polynomial time on a")
    print("   quantum computer, effectively breaking ECC encryption")
    print("2. This breaks the mathematical foundation of ECC security")
    print("3. Quantum computers would need fewer resources to break ECC")
    print("   compared to RSA of equivalent security (due to ECC's smaller key sizes)")
    print()
    print("Timeline and Implications:")
    print("1. Current quantum computers are not yet powerful enough to break ECC")
    print("2. Experts estimate that quantum computers capable of breaking 256-bit ECC")
    print("   may be developed within the next 10-15 years")
    print("3. Data encrypted with ECC today could be stored by adversaries until")
    print("   quantum computers become available ('harvest now, decrypt later' attacks)")
    print()
    print("Post-Quantum Alternatives:")
    print("1. Lattice-based cryptography (NTRU, CRYSTALS-Kyber)")
    print("2. Hash-based cryptography (SPHINCS+)")
    print("3. Code-based cryptography (McEliece)")
    print("4. Multivariate polynomial cryptography")
    print("5. Isogeny-based cryptography (SIKE)")
    print()
    print("Comparison with RSA:")
    print("1. ECC requires smaller keys than RSA for equivalent security")
    print("2. ECC is more vulnerable to quantum attacks due to smaller key sizes")
    print("3. Both ECC and RSA will be broken by sufficiently powerful quantum computers")
    print()
    print("Best Practices:")
    print("1. Plan for post-quantum cryptography migration")
    print("2. Use hybrid approaches during transition periods")
    print("3. Follow NIST's post-quantum cryptography standardization")
    print("4. If using ECC, prefer P-384 or P-521 curves for longer-term security") 