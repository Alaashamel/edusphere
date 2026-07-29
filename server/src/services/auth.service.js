import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/index.js";
import User from "../models/User.model.js";
import { AppError } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";
import emailService from "./email.service.js";

class AuthService {
  async register({ firstName, lastName, email, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      emailVerificationToken,
      emailVerificationExpire,
    });

    const tokens = await this._generateTokens(user._id);

    emailService.sendVerificationEmail({
      to: email,
      firstName,
      token: rawToken,
    });

    logger.info(`New user registered: ${email}`);

    return {
      user: this._sanitizeUser(user),
      ...tokens,
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.isDisabled) {
      throw new AppError("Account has been disabled", 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    user.lastLogin = new Date();
    const tokens = await this._generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateModifiedOnly: true });

    logger.info(`User logged in: ${email}`);

    return {
      user: this._sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(token) {
    if (!token) {
      throw new AppError("Refresh token required", 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.refreshSecret);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      throw new AppError("Invalid refresh token", 401);
    }

    const tokens = await this._generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateModifiedOnly: true });

    return tokens;
  }

  async logout(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateModifiedOnly: true });
    }
    return true;
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return this._sanitizeUser(user);
  }

  async updateProfile(userId, updateData) {
    const allowedFields = ["firstName", "lastName", "avatar", "preferences"];
    const filteredData = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    const user = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return this._sanitizeUser(user);
  }

  async verifyEmail(token) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateModifiedOnly: true });

    logger.info(`Email verified: ${user.email}`);
    return true;
  }

  async resendVerificationEmail(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email already verified", 400);
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = crypto
      .createHash("sha256")
      .update(emailVerificationToken)
      .digest("hex");
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateModifiedOnly: true });

    emailService.sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      token: emailVerificationToken,
    });

    logger.info(`Verification email resent: ${user.email}`);
    return true;
  }

  async generatePasswordResetToken(email) {
    const user = await User.findOne({ email });
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save({ validateModifiedOnly: true });

    return resetToken;
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshToken = undefined;
    await user.save();

    return true;
  }

  async _generateTokens(userId) {
    const accessToken = jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expire,
    });

    const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpire,
    });

    return { accessToken, refreshToken };
  }

  _sanitizeUser(user) {
    const obj = user.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.twoFactorSecret;
    delete obj.emailVerificationToken;
    delete obj.emailVerificationExpire;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpire;
    delete obj.__v;
    return obj;
  }
}

export default new AuthService();
