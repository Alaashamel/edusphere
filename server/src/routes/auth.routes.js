import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  refreshToken,
  verifyEmail,
  resendVerification,
  setup2FA,
  enable2FA,
  disable2FA,
  verify2FALogin,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, validate(updateProfileSchema), updateProfile);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", authenticate, resendVerification);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

router.get("/2fa/setup", authenticate, setup2FA);
router.post("/2fa/enable", authenticate, enable2FA);
router.post("/2fa/disable", authenticate, disable2FA);
router.post("/2fa/verify", verify2FALogin);

export default router;
