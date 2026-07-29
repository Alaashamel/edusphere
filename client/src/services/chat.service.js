import api from "./api";

const chatService = {
  getChats: () => api.get("/chat"),
  getOrCreateChat: (userId) => api.post("/chat", { userId }),
  getMessages: (chatId, params) => api.get(`/chat/${chatId}/messages`, { params }),
  sendMessage: (chatId, data) => api.post(`/chat/${chatId}/messages`, data),
  markAsRead: (chatId) => api.patch(`/chat/${chatId}/read`),
};

export default chatService;
