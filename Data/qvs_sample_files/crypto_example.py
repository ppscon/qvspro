import rsa
from cryptography.hazmat.primitives.asymmetric import rsa as crypto_rsa
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import hashlib

# RSA example
(pubkey, privkey) = rsa.newkeys(2048)

# AES example
key = os.urandom(32)
iv = os.urandom(16)
cipher = Cipher(algorithms.AES(key), modes.CBC(iv))

# SHA-256 example
sha256_hash = hashlib.sha256(b"Hello, World!")

# ECC example
from ecdsa import SigningKey
sk = SigningKey.generate()

# Quantum-resistant example (for contrast)
from cryptography.hazmat.primitives.asymmetric import dilithium
dilithium_private_key = dilithium.generate_private_key()
