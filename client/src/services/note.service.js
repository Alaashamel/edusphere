import api from "./api";

const noteService = {
  getAll: (params) => api.get("/notes/notes", { params }),
  getById: (id) => api.get(`/notes/notes/${id}`),
  create: (data) => api.post("/notes/notes", data),
  update: (id, data) => api.patch(`/notes/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/notes/${id}`),
  getVersions: (id) => api.get(`/notes/notes/${id}/versions`),
  getAllTags: () => api.get("/notes/notes/tags"),
  // Folders
  getFolders: (params) => api.get("/notes/folders", { params }),
  createFolder: (data) => api.post("/notes/folders", data),
  updateFolder: (id, data) => api.patch(`/notes/folders/${id}`, data),
  deleteFolder: (id) => api.delete(`/notes/folders/${id}`),
};

export default noteService;
