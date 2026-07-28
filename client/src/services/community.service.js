import api from "./api";

const communityService = {
  getPosts: (params) => api.get("/community/posts", { params }),
  getById: (id) => api.get(`/community/posts/${id}`),
  create: (data) => api.post("/community/posts", data),
  update: (id, data) => api.patch(`/community/posts/${id}`, data),
  delete: (id) => api.delete(`/community/posts/${id}`),
  vote: (id, direction) => api.post(`/community/posts/${id}/vote`, { direction }),
  bookmark: (id) => api.post(`/community/posts/${id}/bookmark`),
  addComment: (id, data) => api.post(`/community/posts/${id}/comments`, data),
  voteComment: (postId, commentId, direction) =>
    api.post(`/community/posts/${postId}/comments/${commentId}/vote`, { direction }),
  acceptAnswer: (postId, commentId) =>
    api.post(`/community/posts/${postId}/comments/${commentId}/accept`),
  getBookmarks: (params) => api.get("/community/posts/bookmarks", { params }),
  getTrendingTags: () => api.get("/community/posts/trending-tags"),
};

export default communityService;
