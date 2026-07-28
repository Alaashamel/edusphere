import { Router } from "express";
import {
  chat,
  generateQuiz,
  generateFlashcards,
  assistNote,
  getConversations,
  getConversation,
  deleteConversation,
} from "../controllers/ai.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { chatSchema, quizSchema, flashcardSchema, noteAssistSchema } from "../validators/ai.validator.js";
import rateLimit from "express-rate-limit";

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many AI requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authenticate);
router.use(aiLimiter);

router.post("/chat", validate(chatSchema), chat);
router.post("/quiz", validate(quizSchema), generateQuiz);
router.post("/flashcards", validate(flashcardSchema), generateFlashcards);
router.post("/note-assist", validate(noteAssistSchema), assistNote);
router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversation);
router.delete("/conversations/:id", deleteConversation);

export default router;
