# @yourname/secure-jwt-rotation

A plug-and-play JWT authentication manager with:

- **Key rotation** out of the box  
- **Token revocation** via Redis, Memcached, or in-memory fallback  
- **Access & refresh token** generation  
- **Express middleware** for role-based route protection  
- Fully configurable TTLs and secret generators

## 🚀 Installation

```bash
npm install secure-jwt-rotation
```

Or with Yarn:

```bash
yarn add secure-jwt-rotation
```

## 🔧 Usage

```js
const express = require('express');
const Redis = require('ioredis');
const mongoose = require('mongoose');

const { createAuthManager } = require('secure-jwt-rotation');

// Initialize Redis (optional)
const redis = new Redis();

// Build auth manager
const auth = createAuthManager({
  redisClient: redis,
  accessTokenTTL: '30m',
  refreshTokenTTL: '14d',
});

// Example Mongoose user model
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  role: String,
}));

const app = express();
app.use(express.json());

// Issue tokens
app.post('/login', async (req, res) => {
  // Authenticate user...
  const userId = '...';
  const role = 'user';

  const accessToken = auth.generateAccessToken({ id: userId, role });
  const { token: refreshToken, jti } = auth.generateRefreshToken({ id: userId, role });

  res.json({ accessToken, refreshToken });
});

// Protected route
app.get(
  '/admin/data',
  auth.verifyAccessToken({ allowedRoles: ['admin'], model: User }),
  (req, res) => {
    res.json({ secretData: '…', you: req.user });
  }
);

// Revoke a refresh‐token
app.post('/logout', async (req, res) => {
  const { jti } = req.body;
  await auth.revokeToken(jti);
  res.sendStatus(204);
});

app.listen(3000);
```

## 🏗️ API

### `createAuthManager(userConfig)`

Returns an object with:

- **Token methods**  
  - `generateAccessToken(payload)`  
  - `generateRefreshToken(payload)` → `{ token, jti }`  
  - `verifyToken(token)` → `payload`  
  - `revokeToken(jti, expInSec?)`  

- **Key methods**  
  - `rotateKey()`  
  - `getCurrentKeyId()`  
  - `getKeyById(kid)`  
  - `cleanupExpiredKeys(ttlDays?)`  

- **Middleware**  
  - `verifyAccessToken({ allowedRoles, model })`  

### Configuration options

| Option               | Type      | Default       | Description                              |
| -------------------- | --------- | ------------- | ---------------------------------------- |
| `accessTokenTTL`     | `string`  | `'15m'`       | JWT `expiresIn` for access tokens        |
| `refreshTokenTTL`    | `string`  | `'7d'`        | JWT `expiresIn` for refresh tokens       |
| `tokenExpirationSec` | `number`  | `604800`      | Seconds until a revoked JTI expires      |
| `secretGenerator`    | `function`| Crypto random | Used when generating new key secrets     |
| `redisClient`        | `object`  | `null`        | ioredis client for distributed blacklist |
| `memcachedClient`    | `object`  | `null`        | memcached client for distributed cache   |

## 🔮 Future Enhancements

- HSM/KMS integration for key storage  
- Persistent key store (e.g., database)  
- Webhooks on key rotation  
- Built-in metrics (rotations, revokes)

## 📄 License

MIT © [Yogesh D]
