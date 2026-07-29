import Chat from "../models/Chat.model.js";
import Message from "../models/Message.model.js";
import { AppError } from "../middlewares/errorHandler.js";

class ChatService {
  async getOrCreateChat(userId1, userId2) {
    let chat = await Chat.findOne({
      participants: { $all: [userId1, userId2], $size: 2 },
    }).populate("participants", "firstName lastName avatar email");

    if (!chat) {
      chat = await Chat.create({ participants: [userId1, userId2] });
      chat = await chat.populate("participants", "firstName lastName avatar email");
    }

    return chat;
  }

  async getUserChats(userId) {
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "firstName lastName avatar email")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    return chats.map((chat) => ({
      ...chat.toObject(),
      unreadCount: chat.unreadCount?.get(userId.toString()) || 0,
    }));
  }

  async getMessages(chatId, userId, { page = 1, limit = 50 } = {}) {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      throw new AppError("Chat not found", 404);
    }

    const total = await Message.countDocuments({ chat: chatId });
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return {
      messages: messages.reverse(),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  async markAsRead(chatId, userId) {
    await Message.updateMany(
      { chat: chatId, sender: { $ne: userId }, "readBy.user": { $ne: userId } },
      { $push: { readBy: { user: userId, readAt: new Date() } } }
    );

    const chat = await Chat.findById(chatId);
    if (chat) {
      chat.unreadCount.set(userId.toString(), 0);
      await chat.save();
    }
  }

  async sendMessage(chatId, senderId, { content, type = "text", fileUrl, fileName }) {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(senderId)) {
      throw new AppError("Chat not found", 404);
    }

    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      content,
      type,
      fileUrl,
      fileName,
    });

    await message.populate("sender", "firstName lastName avatar");
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    return message;
  }
}

export default new ChatService();
