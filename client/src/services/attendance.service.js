import api from "./api";

const attendanceService = {
  getStats: () => api.get("/attendance/stats"),
  getAll: () => api.get("/attendance"),
  getByCourse: (courseId) => api.get(`/attendance/course/${courseId}`),
  getByDateRange: (startDate, endDate) =>
    api.get(`/attendance/range`, { params: { startDate, endDate } }),
  mark: (data) => api.post("/attendance", data),
  removeRecord: (courseId, date) => api.delete(`/attendance/${courseId}/${date}`),
};

export default attendanceService;
