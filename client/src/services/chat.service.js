import api from "./api";

const chatService = {
  getChats: () => api.get("/chat"),
  getOrCreateChat: (userId) => api.post("/chat", { userId }),
  getMessages: (chatId, params) => api.get(`/chat/${chatId}/messages`, { params }),
  markAsRead: (chatId) => api.patch(`/chat/${chatId}/read`),
};

export default chatService;
