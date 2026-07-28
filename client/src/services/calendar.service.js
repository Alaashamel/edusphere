import api from "./api";

const calendarService = {
  getAll: (params) => api.get("/calendar", { params }),
  getById: (id) => api.get(`/calendar/${id}`),
  create: (data) => api.post("/calendar", data),
  update: (id, data) => api.patch(`/calendar/${id}`, data),
  delete: (id) => api.delete(`/calendar/${id}`),
  getToday: () => api.get("/calendar/today"),
  getUpcoming: (days) => api.get("/calendar/upcoming", { params: { days } }),
};

export default calendarService;
