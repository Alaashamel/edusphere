import api from "./api";

const adminService = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getModerationQueue: () => api.get("/admin/moderation"),
  getActivityLog: (days) => api.get("/admin/activity", { params: { days } }),
};

export default adminService;
