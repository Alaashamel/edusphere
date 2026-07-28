import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  Send,
  Loader2,
  MessageSquare,
  Search,
  Image,
  Paperclip,
  Smile,
  ArrowLeft,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import chatService from "../../../services/chat.service";
import { formatDate } from "../../../utils/helpers";

let socket = null;

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const queryClient = useQueryClient();

  const { data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: () => chatService.getChats().then((r) => r.data.data.chats),
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("Socket connected"));
    socket.on("disconnect", () => console.log("Socket disconnected"));

    socket.on("message:new", (message) => {
      queryClient.invalidateQueries(["chats"]);
      if (message.chat === selectedChat?._id) {
        queryClient.invalidateQueries(["messages", selectedChat._id]);
      }
    });

    socket.on("user:online", () => queryClient.invalidateQueries(["chats"]));
    socket.on("user:offline", () => queryClient.invalidateQueries(["chats"]));

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [selectedChat, queryClient]);

  const startChat = async (userId) => {
    try {
      const res = await chatService.getOrCreateChat(userId);
      setSelectedChat(res.data.data.chat);
    } catch {
      toast.error("Failed to start chat");
    }
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-140px)]">
      <div className="flex h-full rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border">
        {/* Chat List Sidebar */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card flex flex-col
            ${selectedChat ? "hidden md:flex" : "flex"}`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" className="input pl-9 text-sm" placeholder="Search conversations..." />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No conversations yet. Start chatting from a user's profile.
                </p>
              </div>
            ) : (
              chats?.map((chat) => {
                const otherUser = chat.participants.find(
                  (p) => p._id !== localStorage.getItem("userId")
                );
                return (
                  <ChatListItem
                    key={chat._id}
                    chat={chat}
                    otherUser={otherUser}
                    isSelected={selectedChat?._id === chat._id}
                    onClick={() => setSelectedChat(chat)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-gray-50 dark:bg-dark-bg
            ${selectedChat ? "flex" : "hidden md:flex"}`}
        >
          {selectedChat ? (
            <ChatArea
              chat={selectedChat}
              onBack={() => setSelectedChat(null)}
              socket={socket}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Select a conversation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose from your existing chats or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatListItem({ chat, otherUser, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors
        ${isSelected
          ? "bg-primary-50 dark:bg-primary-900/20"
          : "hover:bg-gray-50 dark:hover:bg-dark-surface"
        }`}
    >
      <div className="relative">
        {otherUser?.avatar ? (
          <img src={otherUser.avatar} className="w-11 h-11 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Unknown"}
          </h4>
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
            {chat.lastMessageAt && formatDate(chat.lastMessageAt)}
          </span>
        </div>
        {chat.lastMessage && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {chat.lastMessage.content || "Attachment"}
          </p>
        )}
      </div>
      {chat.unreadCount > 0 && (
        <span className="bg-primary-600 text-white text-xs font-medium rounded-full px-2 py-0.5 shrink-0">
          {chat.unreadCount}
        </span>
      )}
    </div>
  );
}

function ChatArea({ chat, onBack, socket }) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const queryClient = useQueryClient();

  const otherUser = chat.participants.find(
    (p) => p._id !== localStorage.getItem("userId")
  );

  const { data: messagesData } = useQuery({
    queryKey: ["messages", chat._id],
    queryFn: () => chatService.getMessages(chat._id).then((r) => r.data.data),
  });

  const messages = messagesData?.messages || [];

  useEffect(() => {
    if (socket && chat._id) {
      socket.emit("chat:join", chat._id);
      socket.emit("message:read", chat._id);

      const handleTyping = ({ userId, isTyping: typing }) => {
        if (userId !== localStorage.getItem("userId")) {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            if (typing) next.add(userId);
            else next.delete(userId);
            return next;
          });
        }
      };

      socket.on("typing:update", handleTyping);
      return () => {
        socket.emit("chat:leave", chat._id);
        socket.off("typing:update", handleTyping);
      };
    }
  }, [socket, chat._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    socket.emit("message:send", {
      chatId: chat._id,
      content: input.trim(),
      type: "text",
    });
    setInput("");
    socket.emit("typing:stop", chat._id);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket?.emit("typing:start", chat._id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit("typing:stop", chat._id);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
        <button onClick={onBack} className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {otherUser?.avatar ? (
          <img src={otherUser.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {otherUser?.firstName} {otherUser?.lastName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {typingUsers.size > 0 ? "Typing..." : "Online"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.sender._id === localStorage.getItem("userId");
          return (
            <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                ? "bg-primary-600 text-white rounded-br-md"
                : "bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm border border-gray-100 dark:border-dark-border"
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isOwn ? "text-primary-200" : "text-gray-400 dark:text-gray-500"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="input resize-none min-h-[40px] max-h-[120px]"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="btn-primary px-4 h-10 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
