import { AppError } from "./errorHandler.js";

export const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "moderator")) {
    return next(new AppError("Access denied. Admin privileges required.", 403));
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("Access denied. Super admin privileges required.", 403));
  }
  next();
};
