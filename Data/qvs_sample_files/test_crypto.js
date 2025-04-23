// Test file with quantum-vulnerable cryptography
const crypto = require('crypto');

// Generate RSA key pair - vulnerable to quantum computing attacks
function generateRSAKeys() {
  // RSA key generation with 2048 bit length
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
}

// AES-128 encryption - also potentially vulnerable
function encryptAES128(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
}

// Using ECC for digital signatures - vulnerable to quantum attacks
function generateECCKeys() {
  return crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'sec1',
      format: 'pem'
    }
  });
}

module.exports = {
  generateRSAKeys,
  encryptAES128,
  generateECCKeys
}; 