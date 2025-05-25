const { createCacheAdapter } = require("./cacheAdapter");

function createBlackListService (config) {
   const cache = createCacheAdapter({
    redisClient: config.redisClient,
    memCachedClient: config.memCachedClient,
   });

   async function add (jti, expInSec = config.tokenExpirationSec) {
    await cache.set(`blacklist:${jti}`, 'true', expInSec);
   }

   async function check(jti) {
    return (await cache.get(`blacklist:${jti}`)) === 'true';
   }

   return { add, check };

}

module.exports = {createBlackListService}