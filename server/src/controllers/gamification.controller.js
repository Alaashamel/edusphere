import gamificationService from "../services/gamification.service.js";

export const getStats = async (req, res, next) => {
  try {
    const stats = await gamificationService.getStats(req.user._id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const result = await gamificationService.recordLogin(req.user._id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const lb = await gamificationService.getLeaderboard(limit);
    res.json({ success: true, data: lb });
  } catch (error) {
    next(error);
  }
};

export const getBadges = async (req, res, next) => {
  try {
    const badges = await gamificationService.seedBadges();
    res.json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
};
