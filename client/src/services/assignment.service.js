import api from "./api";

const assignmentService = {
  getAll: (params) => api.get("/assignments", { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post("/assignments", data),
  update: (id, data) => api.patch(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  grade: (id, data) => api.post(`/assignments/${id}/grade`, data),
  getOverdue: () => api.get("/assignments/overdue"),
  getUpcoming: (days) => api.get("/assignments/upcoming", { params: { days } }),
};

export default assignmentService;
