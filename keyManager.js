function createKeyManager (config) {
    const keyStore = {
        current: 'kid-1',
        'kid-1': {
            secret: config.secretGenerator(),
            createdAt: new Date()
        }
    }


function rotateKey () {
    const kid = 'kid-' + Date.now();
    keyStore[kid] = { secret: config.secretGenerator(), createdAt: new Date()};
    keyStore.current = kid;
    return kid;
}

function getKeyById (kid) {
    return keyStore[kid]?.secret || null;
}

function getCurrentKeyId () {
    return keyStore.current;
}

function getCurrentSecret () {
    return getKeyById(getCurrentKeyId());
}

function cleanupExpiredKeys (ttlDays = 7) {
    const threshold = Date.now() - ttlDays * 86400000;
    for (const [kid, key] of Object.entries(keyStore)) {
        if(kid !== 'current' && key.createdAt.getTime() < threshold){
            delete keyStore[kid];
        }
    }
}


return {
    rotateKey,
    getKeyById,
    getCurrentKeyId,
    getCurrentSecret,
    cleanupExpiredKeys
};

}

module.exports = {createKeyManager}