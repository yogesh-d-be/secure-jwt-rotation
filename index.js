const { createConfig } = require('./config');
const { createKeyManager } = require('./keyManager');
const { createBlackListService } = require('./blackListService');
const { createTokenService } = require('./tokenService');

function createAuthManager(userConfig = {}) {
  const config = createConfig(userConfig);
  const keyManager = createKeyManager(config);
  const blacklistService = createBlackListService(config);
  const tokenService = createTokenService(config, keyManager, blacklistService);

  return {
    ...tokenService,
    ...keyManager,
    cleanupExpiredKeys: keyManager.cleanupExpiredKeys,
  };
}

module.exports = { createAuthManager };
