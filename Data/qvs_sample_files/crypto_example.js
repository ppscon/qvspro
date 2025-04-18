const crypto = require('crypto');

// RSA example
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

// AES example
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// SHA-256 example
const hash = crypto.createHash('sha256');
hash.update('Hello, World!');
console.log(hash.digest('hex'));
