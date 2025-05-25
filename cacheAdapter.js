class InMemoryCache {
    constructor () {
        this.store = new Map();
    }

    async set(key, value, ttlSec) {
        this.store.set(key, {value, expiresAt: Date.now() + ttlSec *1000});
    }

    async get (key) {
        const entry = this.store.get(key);
        if(!entry) return null;
        if(Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
}

function createCacheAdapter ({redisClient = null, memCachedClient = null} = {}) {
    if(redisClient) {
        return {
            set: (key, value, ttl) => redisClient.set(key, value, 'EX', ttl),
            get: (key) => redisClient.get(key)
        }
    }
    if(memCachedClient) {
        return {
            set: (key, value, ttl) => new Promise((res, rej) => memCachedClient.set(key, value, ttl, (err) => (err ? rej(err): res()))),
            get: (key) => new Promise((rej, res) =>  memCachedClient.get(key, (err, data) => (err ? rej(err) : res(data))))
        };
    }
    return new InMemoryCache();
}

module.exports = {createCacheAdapter}