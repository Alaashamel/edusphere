import { AppError } from "./errorHandler.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Access denied. Not authenticated.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("Access denied. Insufficient permissions.", 403)
      );
    }

    next();
  };
};
