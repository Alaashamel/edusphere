import api from "./api";

const eventService = {
  getEvents: (params) => api.get("/events", { params }),
  getById: (id) => api.get(`/events/${id}`),
  getMyEvents: () => api.get("/events/my"),
  getUpcoming: () => api.get("/events/upcoming"),
  getCalendarEvents: (startDate, endDate) => api.get("/events/calendar", { params: { startDate, endDate } }),
  create: (data) => api.post("/events", data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  register: (id) => api.post(`/events/${id}/register`),
  cancel: (id) => api.post(`/events/${id}/cancel`),
};

export default eventService;
