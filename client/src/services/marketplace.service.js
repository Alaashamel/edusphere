import api from "./api";

const marketplaceService = {
  getItems: (params) => api.get("/marketplace/items", { params }),
  getById: (id) => api.get(`/marketplace/items/${id}`),
  create: (data) => api.post("/marketplace/items", data),
  update: (id, data) => api.patch(`/marketplace/items/${id}`, data),
  delete: (id) => api.delete(`/marketplace/items/${id}`),
  favorite: (id) => api.post(`/marketplace/items/${id}/favorite`),
  rate: (id, data) => api.post(`/marketplace/items/${id}/rate`, data),
  getMyListings: (params) => api.get("/marketplace/items/my", { params }),
  getFavorites: (params) => api.get("/marketplace/items/favorites", { params }),
};

export default marketplaceService;
