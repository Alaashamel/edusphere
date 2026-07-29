import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { connectRedis } from "../src/config/redis.js";
import logger from "../src/utils/logger.js";

let isReady = false;
let initPromise = null;

async function init() {
  if (isReady) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await connectDB();
      logger.info("MongoDB connected for serverless");
    } catch (error) {
      logger.error("Failed to connect MongoDB:", error.message);
    }

    try {
      await connectRedis();
      logger.info("Redis connected for serverless");
    } catch (error) {
      logger.warn("Redis not available, features requiring Redis will be limited:", error.message);
    }

    isReady = true;
  })();

  return initPromise;
}

export default async function handler(req, res) {
  await init();
  return app(req, res);
}
