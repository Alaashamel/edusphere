import api from "./api";

const gamificationService = {
  getStats: () => api.get("/gamification/stats"),
  getLeaderboard: (limit) => api.get("/gamification/leaderboard", { params: { limit } }),
  getBadges: () => api.get("/gamification/badges"),
  checkIn: () => api.post("/gamification/checkin"),
};

export default gamificationService;
