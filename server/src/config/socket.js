import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import Message from "../models/Message.model.js";
import Chat from "../models/Chat.model.js";
import logger from "../utils/logger.js";

let io;
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.userId}`);
    onlineUsers.set(socket.userId, socket.id);
    io.emit("user:online", { userId: socket.userId });

    socket.on("chat:join", async (chatId) => {
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(socket.userId)) return;
      socket.join(`chat:${chatId}`);
    });

    socket.on("chat:leave", (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on("message:send", async (data) => {
      try {
        const { chatId, content, type = "text", fileUrl, fileName } = data;

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.userId)) return;

        const message = await Message.create({
          chat: chatId,
          sender: socket.userId,
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

        io.to(`chat:${chatId}`).emit("message:new", message);

        const otherParticipant = chat.participants.find(
          (p) => p.toString() !== socket.userId
        );
        if (otherParticipant) {
          const otherSocketId = onlineUsers.get(otherParticipant.toString());
          if (otherSocketId) {
            io.to(otherSocketId).emit("message:notification", {
              chatId,
              message,
            });
          }
        }
      } catch (error) {
        logger.error("Message send error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing:start", (chatId) => {
      socket.to(`chat:${chatId}`).emit("typing:update", {
        userId: socket.userId,
        chatId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (chatId) => {
      socket.to(`chat:${chatId}`).emit("typing:update", {
        userId: socket.userId,
        chatId,
        isTyping: false,
      });
    });

    socket.on("message:read", async (chatId) => {
      await Message.updateMany(
        { chat: chatId, sender: { $ne: socket.userId }, "readBy.user": { $ne: socket.userId } },
        { $push: { readBy: { user: socket.userId, readAt: new Date() } } }
      );

      const chat = await Chat.findById(chatId);
      if (chat) {
        chat.unreadCount.set(socket.userId.toString(), 0);
        await chat.save();
      }

      socket.to(`chat:${chatId}`).emit("message:read:ack", {
        chatId,
        userId: socket.userId,
      });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);
      io.emit("user:offline", { userId: socket.userId });
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => io;
export const isUserOnline = (userId) => onlineUsers.has(userId);
export const getOnlineUsers = () => Array.from(onlineUsers.keys());
