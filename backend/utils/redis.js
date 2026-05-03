const Redis = require("ioredis");
const logger = require("./logger");

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);

  redis.on("connect", () => {
    logger.info("✅ Connected to Redis");
  });

  redis.on("error", (err) => {
    logger.error("❌ Redis Error:", err);
  });
} else {
  logger.warn("⚠️ REDIS_URL not found. Caching will be disabled.");
}

const getCache = async (key) => {
  if (!redis) return null;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

const setCache = async (key, data, expireInSeconds = 3600) => {
  if (!redis) return;
  await redis.set(key, JSON.stringify(data), "EX", expireInSeconds);
};

const delCache = async (key) => {
  if (!redis) return;
  await redis.del(key);
};

module.exports = { redis, getCache, setCache, delCache };
