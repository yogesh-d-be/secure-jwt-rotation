const crypto = require('crypto');

function defaultSecretGenerator() {
    return crypto.randomBytes(64).toString('hex');
}

function createConfig (userConfig = {}) {
    return {
        accessTokenTTL: userConfig.accessTokenTTL || '15m',
        refreshTokenTTL: userConfig.refreshTokenTTL || '7d',
        tokenExpirationSec: userConfig.tokenExpirationSec || 60*60*24*7,
        secretGenerator: userConfig.secretGenerator || defaultSecretGenerator,
        redisClient: userConfig.redisClient || null,
        memcachedClient: userConfig.memcachedClient || null
    }
}

module.exports = {createConfig};