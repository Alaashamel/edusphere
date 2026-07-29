import chatService from "../services/chat.service.js";

export const getChats = async (req, res, next) => {
  try {
    const chats = await chatService.getUserChats(req.user._id);
    res.json({ success: true, data: { chats } });
  } catch (error) {
    next(error);
  }
};

export const getOrCreateChat = async (req, res, next) => {
  try {
    const chat = await chatService.getOrCreateChat(req.user._id, req.body.userId);
    res.json({ success: true, data: { chat } });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await chatService.getMessages(req.params.chatId, req.user._id, { page, limit });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    await chatService.markAsRead(req.params.chatId, req.user._id);
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const message = await chatService.sendMessage(req.params.chatId, req.user._id, req.body);
    res.status(201).json({ success: true, data: { message } });
  } catch (error) {
    next(error);
  }
};
