import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { config } from "../config/index.js";
import User from "../models/User.model.js";
import logger from "../utils/logger.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: `${config.apiUrl}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email returned from Google"), null);
        }

        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          user.lastLogin = new Date();
          await user.save({ validateModifiedOnly: true });
          return done(null, user);
        }

        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          user.isEmailVerified = true;
          user.lastLogin = new Date();
          await user.save({ validateModifiedOnly: true });
          return done(null, user);
        }

        user = await User.create({
          firstName: profile.name?.givenName || "Google",
          lastName: profile.name?.familyName || "User",
          email,
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value || "",
          isEmailVerified: true,
          lastLogin: new Date(),
        });

        logger.info(`New user from Google OAuth: ${email}`);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: config.github.clientId,
      clientSecret: config.github.clientSecret,
      callbackURL: `${config.apiUrl}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value ||
          (profile.username ? `${profile.username}@github.user` : null);
        if (!email) {
          return done(new Error("No email returned from GitHub"), null);
        }

        let user = await User.findOne({ githubId: profile.id });
        if (user) {
          user.lastLogin = new Date();
          await user.save({ validateModifiedOnly: true });
          return done(null, user);
        }

        user = await User.findOne({ email });
        if (user) {
          user.githubId = profile.id;
          user.isEmailVerified = true;
          user.lastLogin = new Date();
          await user.save({ validateModifiedOnly: true });
          return done(null, user);
        }

        const [firstName, ...lastParts] = (profile.displayName || profile.username || "GitHub User").split(" ");

        user = await User.create({
          firstName: firstName || "GitHub",
          lastName: lastParts.join(" ") || "User",
          email,
          githubId: profile.id,
          avatar: profile.photos?.[0]?.value || "",
          isEmailVerified: true,
          lastLogin: new Date(),
        });

        logger.info(`New user from GitHub OAuth: ${email}`);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
