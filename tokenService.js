const jwt = require('jsonwebtoken');
const {generateTokenId} = require('./utils');

function createTokenService (config, keyManager, blacklistService) {
    function generateAccessToken (payload) {
        return jwt.sign (payload, keyManager.getCurrentSecret(), {
            expiresIn: config.accessTokenTTL,
            header: {kid: keyManager.getCurrentKeyId()}
        });
    }

    function generateRefreshToken (payload) {
        const jti = generateTokenId();
        const token = jwt.sign({...payload, jti}, keyManager.getCurrentSecret(), {
            expiresIn: config.refreshTokenTTL,
            header: {kid: keyManager.getCurrentKeyId()}
        });
        return {token, jti}
    }

    async function verifyToken(token) {
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header) {
      throw new Error('Invalid token format');
    }

    const { kid } = decodedHeader.header;
    const secret = keyManager.getKeyById(kid);
    if (!secret) {
      throw new Error('Invalid token key');
    }

    const payload = jwt.verify(token, secret);
    if (payload.jti && (await blacklistService.check(payload.jti))) {
      throw new Error('Token has been revoked');
    }

    return payload;
  }

 function verifyAccessToken({ allowedRoles = [], model }) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return async function (req, res, next) {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res
            .status(401)
            .json({ message: 'Access denied, no token provided', requireLogin: true });
        }

        const token = authHeader.slice(7);
        const decoded = await verifyToken(token);

    
        if (!decoded.role || !roles.includes(decoded.role)) {
          return res
            .status(403)
            .json({ message: 'Access denied, insufficient permissions' });
        }

        
        const user = await model
          .findById(decoded.id)
          .lean()
          .select('_id role');
        if (!user) {
          return res
            .status(401)
            .json({ message: 'Access denied, invalid token' });
        }

        req.user = decoded; 
        next();
      } catch (err) {
        const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
        return res.status(401).json({ message: msg, requireLogin: true });
      }
    };
  }



  async function revokeToken(jti, exp) {
    await blacklistService.add(jti, exp);
  }


  return {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    verifyAccessToken,
    revokeToken,
  };

}

module.exports = { createTokenService };