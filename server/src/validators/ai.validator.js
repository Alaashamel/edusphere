import { z } from "zod";

export const chatSchema = z.object({
  body: z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().min(1).max(10000),
        })
      )
      .min(1)
      .max(50),
    conversationId: z.string().optional(),
    stream: z.boolean().optional(),
  }),
});

export const quizSchema = z.object({
  body: z.object({
    topic: z.string().min(1).max(500).trim(),
    numQuestions: z.number().min(1).max(20).optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  }),
});

export const flashcardSchema = z.object({
  body: z.object({
    topic: z.string().min(1).max(500).trim(),
    numCards: z.number().min(1).max(50).optional(),
  }),
});

export const noteAssistSchema = z.object({
  body: z.object({
    noteContent: z.string().min(1).max(50000),
    action: z.enum(["summarize", "rewrite", "expand", "flashcards", "quiz"]),
    language: z.string().optional(),
  }),
});
