import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.Signature;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.IvParameterSpec;
import java.security.spec.ECGenParameterSpec;

public class QuantumVulnerableCrypto {
    
    // RSA key generation - vulnerable to quantum computing attacks
    public static KeyPair generateRSAKeys() throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        return keyGen.generateKeyPair();
    }
    
    // RSA encryption - vulnerable to quantum computing attacks
    public static byte[] encryptRSA(PublicKey publicKey, String message) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        return cipher.doFinal(message.getBytes());
    }
    
    // AES-128 key generation - potentially vulnerable
    public static SecretKey generateAES128Key() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(128); // Using 128-bit AES
        return keyGen.generateKey();
    }
    
    // AES-128 encryption
    public static byte[] encryptAES(SecretKey key, String message) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        byte[] iv = new byte[16];
        new SecureRandom().nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, ivSpec);
        return cipher.doFinal(message.getBytes());
    }
    
    // ECC key generation - vulnerable to quantum computing attacks
    public static KeyPair generateECCKeys() throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("EC");
        ECGenParameterSpec ecSpec = new ECGenParameterSpec("secp256r1");
        keyGen.initialize(ecSpec, new SecureRandom());
        return keyGen.generateKeyPair();
    }
    
    // ECC signature - vulnerable to quantum computing attacks
    public static byte[] signECC(PrivateKey privateKey, byte[] data) throws Exception {
        Signature signature = Signature.getInstance("SHA256withECDSA");
        signature.initSign(privateKey);
        signature.update(data);
        return signature.sign();
    }
    
    public static void main(String[] args) {
        try {
            KeyPair rsaKeys = generateRSAKeys();
            byte[] encryptedData = encryptRSA(rsaKeys.getPublic(), "Secret message");
            
            SecretKey aesKey = generateAES128Key();
            byte[] encryptedAesData = encryptAES(aesKey, "Another secret message");
            
            KeyPair eccKeys = generateECCKeys();
            byte[] signature = signECC(eccKeys.getPrivate(), "Data to sign".getBytes());
            
            System.out.println("Cryptographic operations completed successfully.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
} 