import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const googleAuth = (req, res, next) => {
  const { passport } = req.app.locals;
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
};

export const googleCallback = (req, res, next) => {
  const { passport } = req.app.locals;
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${config.frontendUrl}/login?error=google_auth_failed`);
    }

    const accessToken = jwt.sign({ id: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.expire,
    });

    const refreshToken = jwt.sign({ id: user._id }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpire,
    });

    res.redirect(`${config.frontendUrl}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  })(req, res, next);
};

export const githubAuth = (req, res, next) => {
  const { passport } = req.app.locals;
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
};

export const githubCallback = (req, res, next) => {
  const { passport } = req.app.locals;
  passport.authenticate("github", { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${config.frontendUrl}/login?error=github_auth_failed`);
    }

    const accessToken = jwt.sign({ id: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.expire,
    });

    const refreshToken = jwt.sign({ id: user._id }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpire,
    });

    res.redirect(`${config.frontendUrl}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  })(req, res, next);
};
