const crypto = require('crypto');

function generateTokenId() {
  return crypto.randomBytes(16).toString('hex') + '-' + Date.now();
}

module.exports = { generateTokenId };
