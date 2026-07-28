import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import { initSocket } from "./src/config/socket.js";
import logger from "./src/utils/logger.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    const httpServer = app.listen(PORT, () => {
      logger.info(
        `EduSphere server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });

    initSocket(httpServer);
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();
