const crypto = require('crypto');

function generateMD5Hash(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}

console.log(generateMD5Hash('Test data'));
