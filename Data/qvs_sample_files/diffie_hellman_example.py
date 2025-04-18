#!/usr/bin/env python3
# Example file demonstrating Diffie-Hellman key exchange
# This implementation is vulnerable to quantum attacks via Shor's algorithm

import os
import base64
from cryptography.hazmat.primitives.asymmetric import dh
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


def generate_dh_parameters(key_size=2048):
    """
    Generate Diffie-Hellman parameters (p, g)
    
    Args:
        key_size: Size of the prime number in bits
        
    Returns:
        DHParameters object
    """
    # Generate parameters with safe prime
    parameters = dh.generate_parameters(generator=2, key_size=key_size)
    return parameters


def generate_dh_private_key(parameters):
    """
    Generate a private key for Diffie-Hellman key exchange
    
    Args:
        parameters: DHParameters object
        
    Returns:
        DHPrivateKey object
    """
    return parameters.generate_private_key()


def get_public_key(private_key):
    """
    Get the public key from a private key
    
    Args:
        private_key: DHPrivateKey object
        
    Returns:
        DHPublicKey object
    """
    return private_key.public_key()


def compute_shared_key(private_key, peer_public_key):
    """
    Compute the shared key using Diffie-Hellman key exchange
    
    Args:
        private_key: Your DHPrivateKey object
        peer_public_key: The other party's DHPublicKey object
        
    Returns:
        bytes: Raw shared key material
    """
    # Perform the key exchange
    shared_key = private_key.exchange(peer_public_key)
    return shared_key


def derive_encryption_key(shared_key, key_size=32, salt=None):
    """
    Derive an encryption key from shared key material using HKDF
    
    Args:
        shared_key: Raw shared key material
        key_size: Size of the derived key in bytes (default: 32 for AES-256)
        salt: Optional salt value for HKDF
        
    Returns:
        bytes: Derived encryption key
    """
    # Use HKDF to derive a key of appropriate length
    if salt is None:
        salt = os.urandom(16)  # Generate random salt if not provided
    
    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=key_size,
        salt=salt,
        info=b'encryption key',
    ).derive(shared_key)
    
    return derived_key, salt


def encrypt_message(key, message):
    """
    Encrypt a message using AES-GCM with the derived key
    
    Args:
        key: Encryption key derived from shared secret
        message: The message to encrypt (string or bytes)
        
    Returns:
        dict: Contains the encrypted message, nonce, and tag
    """
    # Convert string to bytes if needed
    if isinstance(message, str):
        message = message.encode('utf-8')
    
    # Generate a random nonce
    nonce = os.urandom(12)  # 96 bits for GCM mode
    
    # Create an encryptor
    cipher = Cipher(algorithms.AES(key), modes.GCM(nonce))
    encryptor = cipher.encryptor()
    
    # Encrypt the message
    ciphertext = encryptor.update(message) + encryptor.finalize()
    
    # Return the results
    return {
        'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
        'nonce': base64.b64encode(nonce).decode('utf-8'),
        'tag': base64.b64encode(encryptor.tag).decode('utf-8')
    }


def decrypt_message(key, encrypted_data):
    """
    Decrypt a message using AES-GCM with the derived key
    
    Args:
        key: Encryption key derived from shared secret
        encrypted_data: Dictionary with encrypted data
        
    Returns:
        bytes: Decrypted message
    """
    # Decode base64 data
    ciphertext = base64.b64decode(encrypted_data['ciphertext'])
    nonce = base64.b64decode(encrypted_data['nonce'])
    tag = base64.b64decode(encrypted_data['tag'])
    
    # Create a decryptor
    cipher = Cipher(algorithms.AES(key), modes.GCM(nonce, tag))
    decryptor = cipher.decryptor()
    
    # Decrypt the message
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    
    return plaintext


def simulate_key_exchange():
    """
    Simulate a Diffie-Hellman key exchange between Alice and Bob
    """
    print("\n=== Diffie-Hellman Key Exchange Simulation ===")
    
    # Step 1: Generate shared parameters
    print("Generating Diffie-Hellman parameters (p, g)...")
    parameters = generate_dh_parameters()
    print("Parameters generated (using a 2048-bit prime)")
    
    # Step 2: Alice generates her key pair
    print("\nAlice generates her private and public keys")
    alice_private_key = generate_dh_private_key(parameters)
    alice_public_key = get_public_key(alice_private_key)
    
    # Step 3: Bob generates his key pair
    print("Bob generates his private and public keys")
    bob_private_key = generate_dh_private_key(parameters)
    bob_public_key = get_public_key(bob_private_key)
    
    # Step 4: Alice and Bob exchange public keys
    print("Alice and Bob exchange public keys")
    
    # Step 5: Both compute the shared secret
    print("\nAlice computes the shared secret using her private key and Bob's public key")
    alice_shared_key = compute_shared_key(alice_private_key, bob_public_key)
    
    print("Bob computes the shared secret using his private key and Alice's public key")
    bob_shared_key = compute_shared_key(bob_private_key, alice_public_key)
    
    # Step 6: Verify that both derived the same shared secret
    print("\nVerifying that both parties derived the same shared secret...")
    if alice_shared_key == bob_shared_key:
        print("✓ Success! Both parties derived the same shared secret")
        print(f"Shared secret length: {len(alice_shared_key)} bytes")
    else:
        print("✗ Error: The shared secrets don't match")
    
    # Step 7: Derive encryption keys
    salt = os.urandom(16)
    alice_encryption_key, _ = derive_encryption_key(alice_shared_key, salt=salt)
    bob_encryption_key, _ = derive_encryption_key(bob_shared_key, salt=salt)
    
    print("\nBoth parties derive encryption keys using HKDF")
    print(f"Derived key length: {len(alice_encryption_key)} bytes (256 bits)")
    
    # Step 8: Use the keys for encrypted communication
    print("\n=== Encrypted Communication Using Derived Keys ===")
    
    # Alice encrypts a message for Bob
    message = "Hello Bob! This is a secret message from Alice."
    print(f"Alice's original message: '{message}'")
    
    encrypted = encrypt_message(alice_encryption_key, message)
    print("Alice encrypts the message using AES-GCM with her derived key")
    
    # Bob decrypts Alice's message
    print("Bob decrypts the message using his derived key")
    decrypted = decrypt_message(bob_encryption_key, encrypted)
    print(f"Bob's decrypted message: '{decrypted.decode('utf-8')}'")
    
    return True


def demonstrate_mitm_vulnerability():
    """
    Demonstrate vulnerability to Man-in-the-Middle attacks without authentication
    """
    print("\n=== Diffie-Hellman Vulnerability: Man-in-the-Middle ===")
    print("Without additional authentication, Diffie-Hellman is vulnerable to MITM attacks:")
    
    # Step 1: Generate shared parameters
    parameters = generate_dh_parameters(1024)  # Smaller key for demonstration
    
    # Step 2: Alice generates her key pair
    alice_private_key = generate_dh_private_key(parameters)
    alice_public_key = get_public_key(alice_private_key)
    
    # Step 3: Bob generates his key pair
    bob_private_key = generate_dh_private_key(parameters)
    bob_public_key = get_public_key(bob_private_key)
    
    # Step 4: Mallory (attacker) generates her key pair
    mallory_private_key_for_alice = generate_dh_private_key(parameters)
    mallory_public_key_for_alice = get_public_key(mallory_private_key_for_alice)
    
    mallory_private_key_for_bob = generate_dh_private_key(parameters)
    mallory_public_key_for_bob = get_public_key(mallory_private_key_for_bob)
    
    print("\nScenario: Alice and Bob want to communicate securely")
    print("Mallory intercepts their communications and performs a MITM attack:")
    
    print("\n1. Alice sends her public key to Bob")
    print("2. Mallory intercepts it and sends her own public key to Bob")
    print("3. Bob sends his public key to Alice")
    print("4. Mallory intercepts it and sends her own public key to Alice")
    
    # Step 5: Alice computes a shared secret with Mallory (thinking it's Bob)
    alice_mallory_shared = compute_shared_key(alice_private_key, mallory_public_key_for_alice)
    alice_encryption_key, salt1 = derive_encryption_key(alice_mallory_shared)
    
    # Step 6: Bob computes a shared secret with Mallory (thinking it's Alice)
    bob_mallory_shared = compute_shared_key(bob_private_key, mallory_public_key_for_bob)
    bob_encryption_key, salt2 = derive_encryption_key(bob_mallory_shared)
    
    # Step 7: Mallory computes shared secrets with both Alice and Bob
    mallory_alice_shared = compute_shared_key(mallory_private_key_for_alice, alice_public_key)
    mallory_alice_key, _ = derive_encryption_key(mallory_alice_shared, salt=salt1)
    
    mallory_bob_shared = compute_shared_key(mallory_private_key_for_bob, bob_public_key)
    mallory_bob_key, _ = derive_encryption_key(mallory_bob_shared, salt=salt2)
    
    print("\nResult: Mallory now has separate shared keys with both Alice and Bob")
    print("Mallory can decrypt, read, and re-encrypt all messages between them")
    
    # Demonstrate the attack
    print("\nDemonstration:")
    message = "Hi Bob, here's my bank account password: supersecret123"
    print(f"Alice sends: '{message}'")
    
    # Alice encrypts with her key (shared with Mallory)
    encrypted = encrypt_message(alice_encryption_key, message)
    
    # Mallory decrypts and reads it
    decrypted_by_mallory = decrypt_message(mallory_alice_key, encrypted)
    print(f"Mallory intercepts and reads: '{decrypted_by_mallory.decode('utf-8')}'")
    
    # Mallory changes the message and re-encrypts for Bob
    modified_message = "Hi Bob, here's my bank account password: hackerfund999"
    print(f"Mallory changes the message to: '{modified_message}'")
    
    # Re-encrypt for Bob
    encrypted_for_bob = encrypt_message(mallory_bob_key, modified_message)
    
    # Bob decrypts what he thinks is from Alice
    decrypted_by_bob = decrypt_message(bob_encryption_key, encrypted_for_bob)
    print(f"Bob receives and decrypts: '{decrypted_by_bob.decode('utf-8')}'")
    
    print("\nMitigation: Use authenticated key exchange protocols like:")
    print("- Authenticated Diffie-Hellman")
    print("- Station-to-Station (STS) protocol")
    print("- TLS with certificate validation")
    
    return True


# Main execution
if __name__ == "__main__":
    print("Diffie-Hellman Key Exchange Example")
    print("==================================")
    print("Diffie-Hellman allows two parties to establish a shared secret")
    print("over an insecure channel without any prior shared secrets.")
    
    # Demonstrate the key exchange process
    simulate_key_exchange()
    
    # Demonstrate MITM vulnerability
    demonstrate_mitm_vulnerability()
    
    # Information about quantum security
    print("\n=== Quantum Computing Security of Diffie-Hellman ===")
    print("Diffie-Hellman is vulnerable to attacks by quantum computers using Shor's algorithm.")
    print("Shor's algorithm can efficiently solve the discrete logarithm problem,")
    print("which is the foundation of Diffie-Hellman's security.")
    print()
    print("Current Diffie-Hellman Security:")
    print("1. Classical computers: Solving discrete logarithm for 2048-bit DH is infeasible")
    print("2. Quantum computers: A sufficiently large quantum computer could break")
    print("   2048-bit DH in hours or days using Shor's algorithm")
    print()
    print("Timeline and Implications:")
    print("1. Current quantum computers are not yet powerful enough to break Diffie-Hellman")
    print("2. Quantum computers capable of breaking standard Diffie-Hellman may be")
    print("   available within the next 10-20 years")
    print("3. All traditional public key exchange methods based on discrete logarithm")
    print("   problems will be vulnerable")
    print()
    print("Post-Quantum Alternatives:")
    print("1. Quantum-resistant key exchange methods:")
    print("   - Supersingular Isogeny Diffie-Hellman (SIDH)")
    print("   - NTRU-based key exchange")
    print("   - Lattice-based key exchange (CRYSTALS-Kyber)")
    print("2. Symmetric key algorithms like AES remain relatively secure against")
    print("   quantum attacks when using sufficient key sizes")
    print("3. The Diffie-Hellman protocol itself is sound, but the underlying")
    print("   mathematical problem needs to be replaced with a quantum-resistant one") 