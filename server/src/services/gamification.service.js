import { Gamification, Badge } from "../models/Gamification.model.js";
import PomodoroSession from "../models/PomodoroSession.model.js";

class GamificationService {
  async getOrCreate(userId) {
    let gam = await Gamification.findOne({ user: userId });
    if (!gam) {
      gam = await Gamification.create({ user: userId });
    }
    await this.checkDailyActivity(gam);
    return gam;
  }

  async checkDailyActivity(gam) {
    const today = new Date().toISOString().split("T")[0];
    if (gam.dailyStats?.date !== today) {
      gam.dailyStats = { xpEarned: 0, focusMinutes: 0, assignmentsDone: 0, date: today };
      await gam.save();
    }
  }

  async awardXp(userId, amount, source, description = "") {
    const gam = await this.getOrCreate(userId);
    gam.xp += amount;
    gam.xpHistory.push({ amount, source, description });

    const newLevel = Math.floor(gam.xp / 500) + 1;
    let leveledUp = false;
    if (newLevel > gam.level) {
      gam.level = newLevel;
      leveledUp = true;
    }

    gam.dailyStats.xpEarned = (gam.dailyStats.xpEarned || 0) + amount;
    await gam.save();

    const badges = await this.checkAchievements(gam);
    return { gam, leveledUp, newBadges: badges };
  }

  async recordLogin(userId) {
    const gam = await this.getOrCreate(userId);
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (gam.lastActivityDate?.toISOString().split("T")[0] === today) {
      return gam;
    }

    if (gam.lastActivityDate?.toISOString().split("T")[0] === yesterday) {
      gam.streak += 1;
    } else {
      gam.streak = 1;
    }

    if (gam.streak > gam.longestStreak) {
      gam.longestStreak = gam.streak;
    }

    gam.lastActivityDate = new Date();
    await gam.save();

    if (gam.streak > 1) {
      const streakXp = Math.min(gam.streak * 10, 100);
      return this.awardXp(userId, streakXp, "login_streak", `${gam.streak} day login streak!`);
    }

    return { gam, leveledUp: false, newBadges: [] };
  }

  async getLeaderboard(limit = 50) {
    const top = await Gamification.find()
      .populate("user", "name email avatar")
      .sort({ xp: -1 })
      .limit(limit);

    return top.map((g, i) => ({
      rank: i + 1,
      user: g.user,
      xp: g.xp,
      level: g.level,
      streak: g.streak,
      title: g.xp >= 25000 ? "Grandmaster" : g.xp >= 15000 ? "Master" : g.xp >= 10000 ? "Expert" : g.xp >= 5000 ? "Scholar" : g.xp >= 2500 ? "Dedicated" : g.xp >= 1000 ? "Learner" : "Beginner",
    }));
  }

  async checkAchievements(gam) {
    const earned = [];
    const badges = await Badge.find({});

    for (const badge of badges) {
      if (gam.achievements.some((a) => a.badge === badge.id)) continue;

      let met = false;
      switch (badge.requirement.type) {
        case "count":
          met = gam.xp >= badge.requirement.target;
          break;
        case "streak":
          met = gam.streak >= badge.requirement.target;
          break;
        case "milestone":
          met = gam.level >= badge.requirement.target;
          break;
      }

      if (met) {
        gam.achievements.push({ badge: badge.id, earnedAt: new Date() });
        await this.awardXp(gam.user, badge.xpReward || 100, "badge", `Earned badge: ${badge.name}`);
        earned.push(badge);
      }
    }

    return earned;
  }

  async getStats(userId) {
    const gam = await this.getOrCreate(userId);
    const badges = await Badge.find({});

    return {
      xp: gam.xp,
      level: gam.level,
      streak: gam.streak,
      longestStreak: gam.longestStreak,
      xpForNextLevel: gam.xpForNextLevel,
      xpProgress: gam.xpProgress,
      totalXpNextLevel: gam.totalXpNextLevel,
      dailyStats: gam.dailyStats,
      achievements: gam.achievements.map((a) => {
        const badge = badges.find((b) => b.id === a.badge);
        return { ...a.toObject(), badgeDetails: badge };
      }),
      xpHistory: gam.xpHistory.slice(-50).reverse(),
      title: gam.xp >= 25000 ? "Grandmaster" : gam.xp >= 15000 ? "Master" : gam.xp >= 10000 ? "Expert" : gam.xp >= 5000 ? "Scholar" : gam.xp >= 2500 ? "Dedicated" : gam.xp >= 1000 ? "Learner" : "Beginner",
    };
  }

  async seedBadges() {
    const existing = await Badge.countDocuments();
    if (existing > 0) return;

    const badges = [
      { id: "first_session", name: "First Focus", description: "Complete your first focus session", icon: "🎯", category: "focus", requirement: { type: "count", target: 1 }, xpReward: 50 },
      { id: "focus_10", name: "Focus Novice", description: "Complete 10 focus sessions", icon: "⏱️", category: "focus", requirement: { type: "count", target: 10 }, xpReward: 100 },
      { id: "focus_50", name: "Focus Master", description: "Complete 50 focus sessions", icon: "🔥", category: "focus", requirement: { type: "count", target: 50 }, xpReward: 250 },
      { id: "streak_3", name: "3-Day Streak", description: "Log in for 3 consecutive days", icon: "📅", category: "streak", requirement: { type: "streak", target: 3 }, xpReward: 50 },
      { id: "streak_7", name: "Week Warrior", description: "Log in for 7 consecutive days", icon: "📆", category: "streak", requirement: { type: "streak", target: 7 }, xpReward: 150 },
      { id: "streak_30", name: "Monthly Legend", description: "Log in for 30 consecutive days", icon: "🌟", category: "streak", requirement: { type: "streak", target: 30 }, xpReward: 500 },
      { id: "level_5", name: "Level 5", description: "Reach level 5", icon: "⭐", category: "special", requirement: { type: "milestone", target: 5 }, xpReward: 200 },
      { id: "level_10", name: "Level 10", description: "Reach level 10", icon: "💎", category: "special", requirement: { type: "milestone", target: 10 }, xpReward: 500 },
      { id: "xp_1000", name: "Century Club", description: "Earn 1,000 XP", icon: "🏅", category: "special", requirement: { type: "count", target: 1000 }, xpReward: 300 },
      { id: "xp_5000", name: "XP Champion", description: "Earn 5,000 XP", icon: "👑", category: "special", requirement: { type: "count", target: 5000 }, xpReward: 1000 },
    ];

    await Badge.insertMany(badges);
  }
}

export default new GamificationService();
