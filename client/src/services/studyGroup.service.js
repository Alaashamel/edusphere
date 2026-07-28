import api from "./api";

const studyGroupService = {
  getAll: () => api.get("/study-groups"),
  getById: (id) => api.get(`/study-groups/${id}`),
  create: (data) => api.post("/study-groups", data),
  update: (id, data) => api.patch(`/study-groups/${id}`, data),
  delete: (id) => api.delete(`/study-groups/${id}`),
  join: (inviteCode) => api.post("/study-groups/join", { inviteCode }),
  leave: (id) => api.post(`/study-groups/${id}/leave`),
  removeMember: (id, memberId) => api.delete(`/study-groups/${id}/members/${memberId}`),
  addAnnouncement: (id, data) => api.post(`/study-groups/${id}/announcements`, data),
};

export default studyGroupService;
