import api from "./api";

const pomodoroService = {
  logSession: (data) => api.post("/pomodoro/log", data),
  getStats: (params) => api.get("/pomodoro/stats", { params }),
};

export default pomodoroService;
