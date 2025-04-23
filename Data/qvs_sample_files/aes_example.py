#!/usr/bin/env python3
# Example file demonstrating AES encryption in various modes
# Note: While AES is considered quantum-resistant for symmetric encryption,
# key distribution mechanisms may be vulnerable

import os
import time
import base64
import binascii
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.hmac import HMAC


def generate_aes_key(key_size=256):
    """
    Generate a random AES key of specified size
    
    Args:
        key_size: Key size in bits (128, 192, or 256)
        
    Returns:
        bytes: Random key
    """
    if key_size not in (128, 192, 256):
        raise ValueError("Key size must be 128, 192, or 256 bits")
    
    # Generate a random key of the specified length
    key_bytes = key_size // 8
    return os.urandom(key_bytes)


def derive_key_from_password(password, salt=None, key_size=256, iterations=100000):
    """
    Derive an AES key from a password using PBKDF2
    
    Args:
        password: Password string
        salt: Salt bytes (generated if None)
        key_size: Key size in bits
        iterations: Number of PBKDF2 iterations
        
    Returns:
        tuple: (key, salt)
    """
    if salt is None:
        salt = os.urandom(16)
    
    if isinstance(password, str):
        password = password.encode('utf-8')
    
    # Derive a key using PBKDF2
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=key_size // 8,
        salt=salt,
        iterations=iterations,
    )
    
    key = kdf.derive(password)
    return key, salt


def encrypt_aes_cbc(key, plaintext, iv=None):
    """
    Encrypt data using AES in CBC mode
    
    Args:
        key: AES key
        plaintext: Data to encrypt
        iv: Initialization vector (generated if None)
        
    Returns:
        dict: IV and ciphertext
    """
    if isinstance(plaintext, str):
        plaintext = plaintext.encode('utf-8')
    
    # Generate IV if not provided
    if iv is None:
        iv = os.urandom(16)
    
    # Pad the plaintext to a multiple of the block size
    padder = padding.PKCS7(algorithms.AES.block_size).padder()
    padded_plaintext = padder.update(plaintext) + padder.finalize()
    
    # Create an encryptor
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    
    # Encrypt the padded plaintext
    ciphertext = encryptor.update(padded_plaintext) + encryptor.finalize()
    
    return {
        'iv': base64.b64encode(iv).decode('utf-8'),
        'ciphertext': base64.b64encode(ciphertext).decode('utf-8')
    }


def decrypt_aes_cbc(key, encrypted_data):
    """
    Decrypt data using AES in CBC mode
    
    Args:
        key: AES key
        encrypted_data: Dictionary with IV and ciphertext
        
    Returns:
        bytes: Decrypted data
    """
    iv = base64.b64decode(encrypted_data['iv'])
    ciphertext = base64.b64decode(encrypted_data['ciphertext'])
    
    # Create a decryptor
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    
    # Decrypt the ciphertext
    padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    
    # Unpad the plaintext
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()
    
    return plaintext


def encrypt_aes_gcm(key, plaintext, aad=None, nonce=None):
    """
    Encrypt data using AES in GCM mode
    
    Args:
        key: AES key
        plaintext: Data to encrypt
        aad: Additional authenticated data (optional)
        nonce: Nonce/IV (generated if None)
        
    Returns:
        dict: Nonce, ciphertext, and tag
    """
    if isinstance(plaintext, str):
        plaintext = plaintext.encode('utf-8')
    
    if isinstance(aad, str):
        aad = aad.encode('utf-8')
    
    # Generate nonce if not provided (12 bytes/96 bits is recommended for GCM)
    if nonce is None:
        nonce = os.urandom(12)
    
    # Create an encryptor
    cipher = Cipher(algorithms.AES(key), modes.GCM(nonce))
    encryptor = cipher.encryptor()
    
    # Add AAD if provided (will be authenticated but not encrypted)
    if aad:
        encryptor.authenticate_additional_data(aad)
    
    # Encrypt the plaintext
    ciphertext = encryptor.update(plaintext) + encryptor.finalize()
    
    # Get the authentication tag
    tag = encryptor.tag
    
    return {
        'nonce': base64.b64encode(nonce).decode('utf-8'),
        'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
        'tag': base64.b64encode(tag).decode('utf-8'),
        'aad': base64.b64encode(aad).decode('utf-8') if aad else None
    }


def decrypt_aes_gcm(key, encrypted_data):
    """
    Decrypt data using AES in GCM mode
    
    Args:
        key: AES key
        encrypted_data: Dictionary with nonce, ciphertext, tag, and optional AAD
        
    Returns:
        bytes: Decrypted data
    """
    nonce = base64.b64decode(encrypted_data['nonce'])
    ciphertext = base64.b64decode(encrypted_data['ciphertext'])
    tag = base64.b64decode(encrypted_data['tag'])
    aad = base64.b64decode(encrypted_data['aad']) if encrypted_data.get('aad') else None
    
    # Create a decryptor
    cipher = Cipher(algorithms.AES(key), modes.GCM(nonce, tag))
    decryptor = cipher.decryptor()
    
    # Add AAD if it was provided during encryption
    if aad:
        decryptor.authenticate_additional_data(aad)
    
    # Decrypt the ciphertext
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    
    return plaintext


def encrypt_aes_ctr(key, plaintext, nonce=None):
    """
    Encrypt data using AES in CTR mode
    
    Args:
        key: AES key
        plaintext: Data to encrypt
        nonce: Nonce/IV (generated if None)
        
    Returns:
        dict: Nonce and ciphertext
    """
    if isinstance(plaintext, str):
        plaintext = plaintext.encode('utf-8')
    
    # For CTR mode, the nonce should be 16 bytes
    # It's split into a nonce (typically first 4 bytes) and counter (remaining 12 bytes)
    if nonce is None:
        nonce = os.urandom(16)
    
    # Create an encryptor
    cipher = Cipher(algorithms.AES(key), modes.CTR(nonce))
    encryptor = cipher.encryptor()
    
    # Encrypt the plaintext
    ciphertext = encryptor.update(plaintext) + encryptor.finalize()
    
    return {
        'nonce': base64.b64encode(nonce).decode('utf-8'),
        'ciphertext': base64.b64encode(ciphertext).decode('utf-8')
    }


def decrypt_aes_ctr(key, encrypted_data):
    """
    Decrypt data using AES in CTR mode
    
    Args:
        key: AES key
        encrypted_data: Dictionary with nonce and ciphertext
        
    Returns:
        bytes: Decrypted data
    """
    nonce = base64.b64decode(encrypted_data['nonce'])
    ciphertext = base64.b64decode(encrypted_data['ciphertext'])
    
    # Create a decryptor
    cipher = Cipher(algorithms.AES(key), modes.CTR(nonce))
    decryptor = cipher.decryptor()
    
    # Decrypt the ciphertext
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    
    return plaintext


def encrypt_with_authentication(key, plaintext, nonce=None):
    """
    Encrypt data using AES-CTR with HMAC authentication (encrypt-then-MAC)
    
    Args:
        key: AES key (will be split for encryption and authentication)
        plaintext: Data to encrypt
        nonce: Nonce/IV (generated if None)
        
    Returns:
        dict: Nonce, ciphertext, and MAC
    """
    if isinstance(plaintext, str):
        plaintext = plaintext.encode('utf-8')
    
    # Split the key into encryption key and authentication key
    # This is a common pattern when the same key is used for both purposes
    encryption_key = key[:len(key)//2]
    auth_key = key[len(key)//2:]
    
    # Generate a nonce if not provided
    if nonce is None:
        nonce = os.urandom(16)
    
    # Encrypt the plaintext using CTR mode
    cipher = Cipher(algorithms.AES(encryption_key), modes.CTR(nonce))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(plaintext) + encryptor.finalize()
    
    # Create a MAC of nonce + ciphertext
    h = HMAC(auth_key, hashes.SHA256())
    h.update(nonce + ciphertext)
    mac = h.finalize()
    
    return {
        'nonce': base64.b64encode(nonce).decode('utf-8'),
        'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
        'mac': base64.b64encode(mac).decode('utf-8')
    }


def decrypt_with_authentication(key, encrypted_data):
    """
    Decrypt data that was encrypted with AES-CTR and authenticated with HMAC
    
    Args:
        key: AES key (will be split for encryption and authentication)
        encrypted_data: Dictionary with nonce, ciphertext, and MAC
        
    Returns:
        bytes: Decrypted data
    """
    nonce = base64.b64decode(encrypted_data['nonce'])
    ciphertext = base64.b64decode(encrypted_data['ciphertext'])
    mac = base64.b64decode(encrypted_data['mac'])
    
    # Split the key into encryption key and authentication key
    encryption_key = key[:len(key)//2]
    auth_key = key[len(key)//2:]
    
    # Verify the MAC
    h = HMAC(auth_key, hashes.SHA256())
    h.update(nonce + ciphertext)
    try:
        h.verify(mac)
    except Exception:
        raise ValueError("MAC verification failed: Data may have been tampered with")
    
    # Decrypt the ciphertext
    cipher = Cipher(algorithms.AES(encryption_key), modes.CTR(nonce))
    decryptor = cipher.decryptor()
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    
    return plaintext


def benchmark_aes_operations(key_sizes=[128, 192, 256], data_sizes=[1024, 10240, 102400]):
    """
    Benchmark AES operations with different key sizes and data sizes
    
    Args:
        key_sizes: List of key sizes to test (in bits)
        data_sizes: List of data sizes to test (in bytes)
        
    Returns:
        dict: Benchmark results
    """
    results = {}
    
    for key_size in key_sizes:
        key_results = {}
        
        # Generate a key for this size
        key = generate_aes_key(key_size)
        
        for data_size in data_sizes:
            # Generate random data of the specified size
            data = os.urandom(data_size)
            
            # Test CBC mode
            start_time = time.time()
            cbc_result = encrypt_aes_cbc(key, data)
            decrypt_aes_cbc(key, cbc_result)
            cbc_time = time.time() - start_time
            
            # Test GCM mode
            start_time = time.time()
            gcm_result = encrypt_aes_gcm(key, data)
            decrypt_aes_gcm(key, gcm_result)
            gcm_time = time.time() - start_time
            
            # Test CTR mode
            start_time = time.time()
            ctr_result = encrypt_aes_ctr(key, data)
            decrypt_aes_ctr(key, ctr_result)
            ctr_time = time.time() - start_time
            
            key_results[data_size] = {
                'cbc': cbc_time,
                'gcm': gcm_time,
                'ctr': ctr_time
            }
        
        results[key_size] = key_results
    
    return results


def demonstrate_key_derivation():
    """
    Demonstrate key derivation from a password
    """
    print("\n=== Password-Based Key Derivation ===")
    
    # Original password
    password = "secure-but-memorable-password"
    print(f"Original password: {password}")
    
    # Derive a key
    start_time = time.time()
    derived_key, salt = derive_key_from_password(password, iterations=100000)
    derivation_time = time.time() - start_time
    
    print(f"Derived a 256-bit key using PBKDF2-HMAC-SHA256 with 100,000 iterations")
    print(f"Salt (hex): {binascii.hexlify(salt).decode('utf-8')}")
    print(f"Derived key (hex): {binascii.hexlify(derived_key).decode('utf-8')}")
    print(f"Derivation time: {derivation_time:.4f} seconds")
    
    # Verify that the same password + salt produces the same key
    print("\nVerifying key derivation reproducibility...")
    new_key, _ = derive_key_from_password(password, salt, iterations=100000)
    print(f"Keys match: {new_key == derived_key}")
    
    # Try with a different password
    print("\nDeriving key with a different password...")
    wrong_password = "different-password"
    wrong_key, _ = derive_key_from_password(wrong_password, salt, iterations=100000)
    print(f"Different password produces different key: {wrong_key != derived_key}")
    
    return derived_key, salt


def demonstrate_aes_cbc():
    """
    Demonstrate AES encryption in CBC mode
    """
    print("\n=== AES-CBC Mode Demonstration ===")
    
    # Generate a key
    key = generate_aes_key(256)
    print(f"Generated a 256-bit AES key: {binascii.hexlify(key[:8]).decode('utf-8')}...")
    
    # Original message
    message = "This is a secret message that will be encrypted with AES-CBC."
    print(f"Original message: '{message}'")
    
    # Encrypt the message
    encrypted_data = encrypt_aes_cbc(key, message)
    print(f"IV (base64): {encrypted_data['iv']}")
    print(f"Ciphertext (base64): {encrypted_data['ciphertext']}")
    
    # Decrypt the message
    decrypted = decrypt_aes_cbc(key, encrypted_data)
    print(f"Decrypted message: '{decrypted.decode('utf-8')}'")
    
    # Try decrypting with a modified IV to demonstrate how CBC mode behaves with errors
    print("\nDemonstrating error propagation in CBC mode:")
    
    # Create a copy of the encrypted data and modify the IV
    tampered_data = encrypted_data.copy()
    iv_bytes = bytearray(base64.b64decode(tampered_data['iv']))
    iv_bytes[0] ^= 0x01  # Flip a bit in the first byte
    tampered_data['iv'] = base64.b64encode(iv_bytes).decode('utf-8')
    
    try:
        tampered_decrypted = decrypt_aes_cbc(key, tampered_data)
        print("Decryption with tampered IV succeeded, but data is corrupted.")
        print(f"Tampered decryption: '{tampered_decrypted.decode('utf-8', errors='replace')}'")
    except Exception as e:
        print(f"Decryption with tampered IV failed: {e}")
    
    return key, encrypted_data


def demonstrate_aes_gcm():
    """
    Demonstrate AES encryption in GCM mode
    """
    print("\n=== AES-GCM Mode Demonstration ===")
    
    # Generate a key
    key = generate_aes_key(256)
    print(f"Generated a 256-bit AES key: {binascii.hexlify(key[:8]).decode('utf-8')}...")
    
    # Original message
    message = "This is a secret message that will be encrypted with AES-GCM."
    print(f"Original message: '{message}'")
    
    # Additional authenticated data
    aad = "This data is not encrypted but is authenticated"
    print(f"Additional authenticated data: '{aad}'")
    
    # Encrypt the message
    encrypted_data = encrypt_aes_gcm(key, message, aad)
    print(f"Nonce (base64): {encrypted_data['nonce']}")
    print(f"Ciphertext (base64): {encrypted_data['ciphertext']}")
    print(f"Authentication tag (base64): {encrypted_data['tag']}")
    
    # Decrypt the message
    decrypted = decrypt_aes_gcm(key, encrypted_data)
    print(f"Decrypted message: '{decrypted.decode('utf-8')}'")
    
    # Try decrypting with a modified tag to demonstrate authentication
    print("\nDemonstrating authentication in GCM mode:")
    
    # Create a copy of the encrypted data and modify the tag
    tampered_data = encrypted_data.copy()
    tag_bytes = bytearray(base64.b64decode(tampered_data['tag']))
    tag_bytes[0] ^= 0x01  # Flip a bit in the first byte
    tampered_data['tag'] = base64.b64encode(tag_bytes).decode('utf-8')
    
    try:
        decrypt_aes_gcm(key, tampered_data)
        print("Decryption with tampered tag succeeded (this should not happen).")
    except Exception as e:
        print(f"Decryption with tampered tag failed as expected: {str(e)}")
    
    # Try modifying the ciphertext to demonstrate authentication
    print("\nDemonstrating ciphertext integrity in GCM mode:")
    tampered_data = encrypted_data.copy()
    ciphertext_bytes = bytearray(base64.b64decode(tampered_data['ciphertext']))
    if len(ciphertext_bytes) > 0:
        ciphertext_bytes[0] ^= 0x01  # Flip a bit in the first byte
        tampered_data['ciphertext'] = base64.b64encode(ciphertext_bytes).decode('utf-8')
    
    try:
        decrypt_aes_gcm(key, tampered_data)
        print("Decryption with tampered ciphertext succeeded (this should not happen).")
    except Exception as e:
        print(f"Decryption with tampered ciphertext failed as expected: {str(e)}")
    
    return key, encrypted_data


def demonstrate_aes_ctr():
    """
    Demonstrate AES encryption in CTR mode
    """
    print("\n=== AES-CTR Mode Demonstration ===")
    
    # Generate a key
    key = generate_aes_key(256)
    print(f"Generated a 256-bit AES key: {binascii.hexlify(key[:8]).decode('utf-8')}...")
    
    # Original message
    message = "This is a secret message that will be encrypted with AES-CTR."
    print(f"Original message: '{message}'")
    
    # Encrypt the message
    encrypted_data = encrypt_aes_ctr(key, message)
    print(f"Nonce (base64): {encrypted_data['nonce']}")
    print(f"Ciphertext (base64): {encrypted_data['ciphertext']}")
    
    # Decrypt the message
    decrypted = decrypt_aes_ctr(key, encrypted_data)
    print(f"Decrypted message: '{decrypted.decode('utf-8')}'")
    
    # Show how CTR mode allows random access decryption
    print("\nDemonstrating random access decryption in CTR mode:")
    
    # Create a longer message
    long_message = "This is a longer message with multiple blocks to demonstrate how CTR mode allows decrypting specific portions without decrypting the entire message."
    print(f"Longer message: '{long_message}'")
    
    # Encrypt the longer message
    long_encrypted = encrypt_aes_ctr(key, long_message)
    
    # Get the ciphertext bytes
    ciphertext_bytes = base64.b64decode(long_encrypted['ciphertext'])
    nonce_bytes = base64.b64decode(long_encrypted['nonce'])
    
    # Decrypt only the first 16 bytes of the ciphertext
    # In CTR mode, we can create a decryptor with the original nonce
    # and only decrypt the portion we want
    cipher = Cipher(algorithms.AES(key), modes.CTR(nonce_bytes))
    decryptor = cipher.decryptor()
    
    # Decrypt the first 16 bytes of ciphertext
    partial_decrypted = decryptor.update(ciphertext_bytes[:16])
    print(f"First 16 bytes decrypted: '{partial_decrypted.decode('utf-8')}'")
    
    return key, encrypted_data


def demonstrate_authenticated_encryption():
    """
    Demonstrate encrypt-then-MAC pattern for authenticated encryption
    """
    print("\n=== Authenticated Encryption Demonstration (Encrypt-then-MAC) ===")
    
    # Generate a key (will be split for encryption and MAC)
    key = generate_aes_key(256)
    print(f"Generated a 256-bit AES key: {binascii.hexlify(key[:8]).decode('utf-8')}...")
    
    # Original message
    message = "This is a secret message that will be encrypted and authenticated."
    print(f"Original message: '{message}'")
    
    # Encrypt and authenticate the message
    encrypted_data = encrypt_with_authentication(key, message)
    print(f"Nonce (base64): {encrypted_data['nonce']}")
    print(f"Ciphertext (base64): {encrypted_data['ciphertext']}")
    print(f"MAC (base64): {encrypted_data['mac']}")
    
    # Decrypt and verify the message
    decrypted = decrypt_with_authentication(key, encrypted_data)
    print(f"Decrypted message: '{decrypted.decode('utf-8')}'")
    
    # Try decrypting with a modified MAC to demonstrate authentication
    print("\nDemonstrating authentication:")
    
    # Create a copy of the encrypted data and modify the MAC
    tampered_data = encrypted_data.copy()
    mac_bytes = bytearray(base64.b64decode(tampered_data['mac']))
    mac_bytes[0] ^= 0x01  # Flip a bit in the first byte
    tampered_data['mac'] = base64.b64encode(mac_bytes).decode('utf-8')
    
    try:
        decrypt_with_authentication(key, tampered_data)
        print("Decryption with tampered MAC succeeded (this should not happen).")
    except Exception as e:
        print(f"Decryption with tampered MAC failed as expected: {str(e)}")
    
    return key, encrypted_data


def benchmark_and_report():
    """
    Benchmark AES operations and report the results
    """
    print("\n=== AES Performance Benchmarking ===")
    print("Benchmarking AES operations with different key and data sizes...")
    
    results = benchmark_aes_operations()
    
    print("\nResults (time in seconds for encrypt+decrypt):")
    print("-" * 80)
    print(f"{'Key Size':<10} {'Data Size':<12} {'CBC':<10} {'GCM':<10} {'CTR':<10}")
    print("-" * 80)
    
    for key_size in results:
        for data_size in results[key_size]:
            print(f"{key_size:<10} {data_size:<12} ", end="")
            print(f"{results[key_size][data_size]['cbc']:<10.5f} ", end="")
            print(f"{results[key_size][data_size]['gcm']:<10.5f} ", end="")
            print(f"{results[key_size][data_size]['ctr']:<10.5f}")
    
    print("-" * 80)
    
    print("\nObservations:")
    print("1. AES-CTR is typically the fastest mode due to parallelizability")
    print("2. AES-GCM offers authenticated encryption but with performance overhead")
    print("3. AES-CBC requires padding and is typically slower than CTR")
    print("4. Key size has minimal impact on performance on modern hardware with AES-NI")
    
    return results


# Main execution
if __name__ == "__main__":
    print("AES Encryption Examples")
    print("=====================")
    print("Advanced Encryption Standard (AES) is a symmetric block cipher")
    print("standardized by NIST. It operates on 128-bit blocks and supports")
    print("key sizes of 128, 192, and 256 bits.")
    
    # Demonstrate password-based key derivation
    demonstrate_key_derivation()
    
    # Demonstrate AES-CBC mode
    demonstrate_aes_cbc()
    
    # Demonstrate AES-GCM mode
    demonstrate_aes_gcm()
    
    # Demonstrate AES-CTR mode
    demonstrate_aes_ctr()
    
    # Demonstrate authenticated encryption
    demonstrate_authenticated_encryption()
    
    # Benchmark AES operations
    benchmark_and_report()
    
    # Information about quantum security
    print("\n=== Quantum Security of AES ===")
    print("AES, as a symmetric encryption algorithm, is relatively resistant to")
    print("quantum attacks compared to asymmetric algorithms like RSA and ECC.")
    print()
    print("Quantum Security Details:")
    print("1. Grover's algorithm can be used against AES, but it only provides")
    print("   a quadratic speedup, reducing security by effectively halving the key size")
    print("2. AES-256 would have approximately 128 bits of security against quantum attacks")
    print("3. This is still considered secure for the foreseeable future")
    print()
    print("Quantum Considerations:")
    print("1. While the AES algorithm itself is relatively quantum-resistant,")
    print("   key exchange mechanisms often rely on asymmetric cryptography (RSA, DH, ECDH)")
    print("   which are vulnerable to quantum attacks")
    print("2. Key distribution and management will need to be adapted for the post-quantum era")
    print("3. Hybrid approaches combining symmetric and post-quantum asymmetric algorithms")
    print("   are recommended for long-term security")
    print()
    print("Best Practices:")
    print("1. Use AES-256 for applications requiring long-term security")
    print("2. Prefer authenticated encryption modes like GCM or encrypt-then-MAC patterns")
    print("3. Implement proper key management practices")
    print("4. Consider quantum-resistant key exchange mechanisms when available")
    print("5. Use strong password-based key derivation with sufficient iterations") 