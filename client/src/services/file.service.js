import api from "./api";

const fileService = {
  getFiles: (params) => api.get("/files", { params }),
  getSharedWithMe: () => api.get("/files/shared"),
  getById: (id) => api.get(`/files/${id}`),
  upload: (formData) =>
    api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    }),
  uploadNewVersion: (id, formData) =>
    api.post(`/files/${id}/version`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  rename: (id, name) => api.patch(`/files/${id}/rename`, { name }),
  move: (id, folderId) => api.patch(`/files/${id}/move`, { folderId }),
  toggleStar: (id) => api.patch(`/files/${id}/star`),
  addTags: (id, tags) => api.patch(`/files/${id}/tags`, { tags }),
  removeTag: (id, tag) => api.delete(`/files/${id}/tags/${tag}`),
  share: (id, userId, permission) => api.patch(`/files/${id}/share`, { userId, permission }),
  removeShare: (id, userId) => api.delete(`/files/${id}/share/${userId}`),
  download: (id) => api.get(`/files/${id}`).then((r) => r.data.data),
  softDelete: (id) => api.delete(`/files/${id}`),
  restore: (id) => api.patch(`/files/${id}/restore`),
  getTrash: () => api.get("/files/trash"),
  getStorageStats: () => api.get("/files/stats"),

  createFolder: (data) => api.post("/files/folders", data),
  getFolders: (parentId) => api.get("/files/folders/list", { params: { parentId } }),
  renameFolder: (id, name) => api.patch(`/files/folders/${id}/rename`, { name }),
  deleteFolder: (id) => api.delete(`/files/folders/${id}`),
};

export default fileService;
