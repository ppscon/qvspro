#include <iostream>
#include <string>
#include <vector>
#include <openssl/rsa.h>
#include <openssl/pem.h>
#include <openssl/aes.h>
#include <openssl/rand.h>
#include <openssl/ec.h>
#include <openssl/ecdsa.h>
#include <openssl/obj_mac.h>

class QuantumVulnerableCrypto {
public:
    // RSA key generation - vulnerable to quantum computing attacks
    static RSA* generateRSAKeys() {
        RSA* rsa = RSA_new();
        BIGNUM* bne = BN_new();
        
        // Set public exponent to 65537
        BN_set_word(bne, RSA_F4);
        
        // Generate key pair with 2048 bits
        RSA_generate_key_ex(rsa, 2048, bne, nullptr);
        
        BN_free(bne);
        return rsa;
    }
    
    // RSA encryption - vulnerable to quantum computing attacks
    static std::vector<unsigned char> encryptRSA(RSA* rsa, const std::string& message) {
        std::vector<unsigned char> encrypted(RSA_size(rsa));
        int encryptedLength = RSA_public_encrypt(
            message.length(),
            reinterpret_cast<const unsigned char*>(message.c_str()),
            encrypted.data(),
            rsa,
            RSA_PKCS1_PADDING
        );
        
        encrypted.resize(encryptedLength);
        return encrypted;
    }
    
    // AES-128 key generation - potentially vulnerable
    static std::vector<unsigned char> generateAES128Key() {
        std::vector<unsigned char> key(16); // 128 bits
        RAND_bytes(key.data(), key.size());
        return key;
    }
    
    // AES-128 encryption
    static std::vector<unsigned char> encryptAES(
        const std::vector<unsigned char>& key,
        const std::string& message
    ) {
        // Create initialization vector
        std::vector<unsigned char> iv(AES_BLOCK_SIZE);
        RAND_bytes(iv.data(), iv.size());
        
        // Prepare output buffer (includes IV at beginning)
        size_t paddedLength = ((message.length() / AES_BLOCK_SIZE) + 1) * AES_BLOCK_SIZE;
        std::vector<unsigned char> output(iv.size() + paddedLength);
        
        // Copy IV to beginning of output
        std::copy(iv.begin(), iv.end(), output.begin());
        
        // Copy message to buffer with padding
        std::vector<unsigned char> paddedMessage(paddedLength, 0);
        std::copy(message.begin(), message.end(), paddedMessage.begin());
        
        // Encrypt using AES-128 in CBC mode
        AES_KEY aesKey;
        AES_set_encrypt_key(key.data(), 128, &aesKey);
        AES_cbc_encrypt(
            paddedMessage.data(),
            output.data() + iv.size(),
            paddedLength,
            &aesKey,
            iv.data(),
            AES_ENCRYPT
        );
        
        return output;
    }
    
    // ECC key generation - vulnerable to quantum computing attacks
    static EC_KEY* generateECCKeys() {
        EC_KEY* key = EC_KEY_new_by_curve_name(NID_X9_62_prime256v1);
        EC_KEY_generate_key(key);
        return key;
    }
    
    // ECC signature - vulnerable to quantum computing attacks
    static std::vector<unsigned char> signECC(
        EC_KEY* key,
        const std::vector<unsigned char>& data
    ) {
        unsigned int sigLen = ECDSA_size(key);
        std::vector<unsigned char> signature(sigLen);
        
        ECDSA_sign(
            0,
            data.data(),
            data.size(),
            signature.data(),
            &sigLen,
            key
        );
        
        signature.resize(sigLen);
        return signature;
    }
};

int main() {
    // RSA example
    RSA* rsaKey = QuantumVulnerableCrypto::generateRSAKeys();
    std::string message = "Secret message for RSA encryption";
    std::vector<unsigned char> encrypted = QuantumVulnerableCrypto::encryptRSA(rsaKey, message);
    std::cout << "RSA encrypted data (length: " << encrypted.size() << " bytes)" << std::endl;
    
    // AES example
    std::vector<unsigned char> aesKey = QuantumVulnerableCrypto::generateAES128Key();
    message = "Secret message for AES encryption";
    std::vector<unsigned char> encryptedAes = QuantumVulnerableCrypto::encryptAES(aesKey, message);
    std::cout << "AES encrypted data (length: " << encryptedAes.size() << " bytes)" << std::endl;
    
    // ECC example
    EC_KEY* eccKey = QuantumVulnerableCrypto::generateECCKeys();
    std::string data = "Message for ECC signing";
    std::vector<unsigned char> dataBytes(data.begin(), data.end());
    std::vector<unsigned char> signature = QuantumVulnerableCrypto::signECC(eccKey, dataBytes);
    std::cout << "ECC signature created (length: " << signature.size() << " bytes)" << std::endl;
    
    // Free allocated resources
    RSA_free(rsaKey);
    EC_KEY_free(eccKey);
    
    return 0;
} 