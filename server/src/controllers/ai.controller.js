import aiService from "../services/ai.service.js";
import Conversation from "../models/Conversation.model.js";
import { AppError } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

export const chat = async (req, res, next) => {
  try {
    const { messages, conversationId, stream } = req.body;

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user: req.user._id,
      });
      if (!conversation) throw new AppError("Conversation not found", 404);
    }

    const userMessage = messages[messages.length - 1];
    if (userMessage.role !== "user") {
      throw new AppError("Last message must be from user", 400);
    }

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const history = conversation
        ? conversation.messages.map((m) => ({ role: m.role, content: m.content }))
        : [];

      const allMessages = [...history, ...messages];

      let fullContent = "";
      let totalTokens = 0;

      try {
        const result = await aiService.chat(allMessages, {
          stream: true,
          onChunk: (chunk) => {
            fullContent += chunk;
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          },
        });
        totalTokens = result.tokens;
      } catch (err) {
        logger.error("AI stream error:", err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ done: true, tokens: totalTokens })}\n\n`);
      res.end();

      if (!conversation) {
        conversation = await Conversation.create({
          user: req.user._id,
          title: userMessage.content.slice(0, 80),
          type: "chat",
          messages: [{ role: "user", content: userMessage.content }],
          totalTokens,
        });
      } else {
        conversation.messages.push({ role: "user", content: userMessage.content });
        conversation.messages.push({ role: "assistant", content: fullContent, tokens: totalTokens });
        conversation.totalTokens += totalTokens;
        await conversation.save();
      }
    } else {
      const history = conversation
        ? conversation.messages.map((m) => ({ role: m.role, content: m.content }))
        : [];

      const allMessages = [...history, ...messages];
      const result = await aiService.chat(allMessages);

      if (!conversation) {
        conversation = await Conversation.create({
          user: req.user._id,
          title: userMessage.content.slice(0, 80),
          type: "chat",
          messages: [
            { role: "user", content: userMessage.content },
            { role: "assistant", content: result.content, tokens: result.tokens },
          ],
          totalTokens: result.tokens,
        });
      } else {
        conversation.messages.push({ role: "user", content: userMessage.content });
        conversation.messages.push({ role: "assistant", content: result.content, tokens: result.tokens });
        conversation.totalTokens += result.tokens;
        await conversation.save();
      }

      res.json({
        success: true,
        data: {
          message: result.content,
          tokens: result.tokens,
          conversationId: conversation._id,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const generateQuiz = async (req, res, next) => {
  try {
    const { topic, numQuestions, difficulty } = req.body;
    const result = await aiService.generateQuiz(topic, { numQuestions, difficulty });

    const conversation = await Conversation.create({
      user: req.user._id,
      title: `Quiz: ${topic}`,
      type: "quiz",
      messages: [
        { role: "user", content: `Generate a quiz about: ${topic}` },
        { role: "assistant", content: JSON.stringify(result.questions) },
      ],
      totalTokens: result.tokens,
    });

    res.json({
      success: true,
      data: {
        questions: result.questions,
        tokens: result.tokens,
        conversationId: conversation._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateFlashcards = async (req, res, next) => {
  try {
    const { topic, numCards } = req.body;
    const result = await aiService.generateFlashcards(topic, { numCards });

    const conversation = await Conversation.create({
      user: req.user._id,
      title: `Flashcards: ${topic}`,
      type: "flashcards",
      messages: [
        { role: "user", content: `Generate flashcards about: ${topic}` },
        { role: "assistant", content: JSON.stringify(result.cards) },
      ],
      totalTokens: result.tokens,
    });

    res.json({
      success: true,
      data: {
        cards: result.cards,
        tokens: result.tokens,
        conversationId: conversation._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const assistNote = async (req, res, next) => {
  try {
    const { noteContent, action, language } = req.body;
    const result = await aiService.assistNote(noteContent, action, { language });

    res.json({
      success: true,
      data: {
        result: result.result,
        tokens: result.tokens,
        action,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id, isActive: true };
    if (type) query.type = type;

    const total = await Conversation.countDocuments(query);
    const conversations = await Conversation.find(query)
      .select("-messages")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { conversations, total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!conversation) throw new AppError("Conversation not found", 404);

    res.json({ success: true, data: { conversation } });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!conversation) throw new AppError("Conversation not found", 404);

    res.json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    next(error);
  }
};
