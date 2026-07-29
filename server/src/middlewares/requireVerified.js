import { AppError } from "./errorHandler.js";

export const requireVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new AppError("Email not verified. Please verify your email to access this feature.", 403));
  }
  next();
};
