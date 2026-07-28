import Redis from "ioredis";
import { config } from "./index.js";
import logger from "../utils/logger.js";

let redis;

const connectRedis = async () => {
  try {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
    });

    redis.on("connect", () => {
      logger.info("Redis connected");
    });

    redis.on("error", (err) => {
      logger.error(`Redis error: ${err.message}`);
    });

    return redis;
  } catch (error) {
    logger.error(`Redis connection error: ${error.message}`);
    throw error;
  }
};

const getRedis = () => {
  if (!redis) {
    throw new Error("Redis not initialized. Call connectRedis() first.");
  }
  return redis;
};

export { connectRedis, getRedis };
