import PomodoroSession from "../models/PomodoroSession.model.js";

class PomodoroService {
  async logSession(data, userId) {
    return PomodoroSession.create({ ...data, user: userId, completed: true, completedAt: new Date() });
  }

  async getStats(userId, { days = 7 } = {}) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sessions = await PomodoroSession.find({
      user: userId,
      completed: true,
      createdAt: { $gte: since },
      type: "focus",
    }).sort({ createdAt: -1 });

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalSessions = sessions.length;

    const dailyData = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyData[key] = 0;
    }

    sessions.forEach((s) => {
      const key = s.createdAt.toISOString().split("T")[0];
      if (dailyData[key] !== undefined) dailyData[key] += s.duration;
    });

    return {
      totalMinutes,
      totalSessions,
      dailyData: Object.entries(dailyData).map(([date, minutes]) => ({ date, minutes })),
    };
  }
}

export default new PomodoroService();
