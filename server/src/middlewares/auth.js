import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { AppError } from "./errorHandler.js";
import User from "../models/User.model.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(decoded.id).select("-password -refreshToken");
    if (!user) {
      throw new AppError("User not found.", 401);
    }

    if (user.isDisabled) {
      throw new AppError("Account has been disabled.", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired token.", 401));
    }
    next(error);
  }
};
