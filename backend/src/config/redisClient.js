let LRU = require('lru-cache');

function resolveLRU(mod) {
  if (!mod) return null;
  if (typeof mod === 'function') return mod;
  if (typeof mod.default === 'function') return mod.default;
  if (typeof mod.LRUCache === 'function') return mod.LRUCache;
  if (mod.default && typeof mod.default.LRUCache === 'function') return mod.default.LRUCache;
  return null;
}

LRU = resolveLRU(LRU);

let cache = null;

function init() {
  if (cache) return cache;
  if (!LRU || typeof LRU !== 'function') {
    console.warn('LRU cache module not available or not a constructor; skipping cache init');
    return null;
  }
  const max = parseInt(process.env.CACHE_MAX || '1000', 10);
  const ttlSeconds = parseInt(process.env.CACHE_TTL || '60', 10);
  cache = new LRU({ max, ttl: ttlSeconds * 1000 });
  console.log(`LRU cache initialized (max=${max}, ttl=${ttlSeconds}s)`);
  return cache;
}

function getClient() { return cache; }

async function get(key) {
  if (!cache) return null;
  const v = cache.get(key);
  return v === undefined ? null : v;
}

async function set(key, value, ttlSeconds) {
  if (!cache) return null;
  if (typeof ttlSeconds === 'number' && ttlSeconds > 0) {
    cache.set(key, value, { ttl: ttlSeconds * 1000 });
  } else {
    cache.set(key, value);
  }
  return true;
}

async function del(key) {
  if (!cache) return null;
  return cache.delete(key);
}

module.exports = { init, getClient, get, set, del };
