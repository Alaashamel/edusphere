import api from "./api";

const analyticsService = {
  getAll: () => api.get("/analytics"),
  getFocus: (days) => api.get("/analytics/focus", { params: { days } }),
  getGpa: () => api.get("/analytics/gpa"),
  getAttendance: () => api.get("/analytics/attendance"),
  getAssignments: () => api.get("/analytics/assignments"),
  getCourses: () => api.get("/analytics/courses"),
};

export default analyticsService;
