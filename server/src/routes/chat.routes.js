import { Router } from "express";
import { getChats, getOrCreateChat, getMessages, markAsRead, sendMessage } from "../controllers/chat.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getChats);
router.post("/", getOrCreateChat);
router.get("/:chatId/messages", getMessages);
router.post("/:chatId/messages", sendMessage);
router.patch("/:chatId/read", markAsRead);

export default router;
