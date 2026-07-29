import mongoose from "mongoose";
import { config } from "./index.js";
import logger from "../utils/logger.js";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.mongoUri).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
    logger.info(`MongoDB connected: ${cached.conn.connection.host}`);
  } catch (error) {
    cached.promise = null;
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

export { connectDB, mongoose };
