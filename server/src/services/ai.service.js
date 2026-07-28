import OpenAI from "openai";
import { config } from "../config/index.js";
import { AppError } from "../middlewares/errorHandler.js";
import logger from "../utils/logger.js";

class AIService {
  constructor() {
    this.client = new OpenAI({ apiKey: config.openaiApiKey });
    this.model = "gpt-4o";
    this.maxTokens = 4096;
  }

  _checkApiKey() {
    if (!config.openaiApiKey) {
      throw new AppError("OpenAI API key not configured", 500);
    }
  }

  async chat(messages, { stream = false, onChunk } = {}) {
    this._checkApiKey();

    const systemMessage = {
      role: "system",
      content: `You are EduSphere AI, an intelligent academic assistant for university students. You help with:
- Answering academic questions across all subjects
- Explaining concepts clearly and concisely
- Breaking down complex topics into digestible parts
- Providing study tips and learning strategies
- Helping with note organization and summarization

Be concise, accurate, and encouraging. Use markdown formatting when helpful.
If you don't know something, say so honestly rather than making it up.`,
    };

    const apiMessages = [systemMessage, ...messages];

    if (stream) {
      const streamResponse = await this.client.chat.completions.create({
        model: this.model,
        messages: apiMessages,
        max_tokens: this.maxTokens,
        stream: true,
      });

      let fullContent = "";
      let totalTokens = 0;

      for await (const chunk of streamResponse) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          fullContent += delta;
          if (onChunk) onChunk(delta);
        }
        if (chunk.usage) {
          totalTokens = chunk.usage.total_tokens;
        }
      }

      return { content: fullContent, tokens: totalTokens };
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: apiMessages,
      max_tokens: this.maxTokens,
    });

    return {
      content: response.choices[0].message.content,
      tokens: response.usage?.total_tokens || 0,
    };
  }

  async generateQuiz(topic, { numQuestions = 5, difficulty = "medium" } = {}) {
    this._checkApiKey();

    const prompt = `Generate a quiz about "${topic}" with exactly ${numQuestions} multiple-choice questions.
Difficulty: ${difficulty}.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Why this answer is correct"
  }
]

Each question must have exactly 4 options. "correct" is the 0-based index of the correct option.`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: this.maxTokens,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new AppError("Failed to parse quiz response", 500);
    }

    const questions = Array.isArray(parsed) ? parsed : parsed.questions || parsed.quiz || [];
    return {
      questions,
      tokens: response.usage?.total_tokens || 0,
    };
  }

  async generateFlashcards(topic, { numCards = 10 } = {}) {
    this._checkApiKey();

    const prompt = `Generate ${numCards} flashcards about "${topic}".
Each flashcard should test a key concept or fact.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "front": "Question or term",
    "back": "Answer or definition"
  }
]`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: this.maxTokens,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new AppError("Failed to parse flashcard response", 500);
    }

    const cards = Array.isArray(parsed) ? parsed : parsed.flashcards || parsed.cards || [];
    return {
      cards,
      tokens: response.usage?.total_tokens || 0,
    };
  }

  async assistNote(noteContent, action, { language } = {}) {
    this._checkApiKey();

    const actions = {
      summarize: "Provide a concise summary of the following note, preserving key points and important details:",
      rewrite: "Rewrite the following note to be clearer and more well-organized while preserving all information:",
      expand: "Expand on the following note with additional details, examples, and context that would be helpful for studying:",
      flashcards: `Convert the following note into flashcards. Return ONLY a valid JSON array: [{"front":"...","back":"..."}]`,
      quiz: `Generate 5 quiz questions from the following note content. Return ONLY a valid JSON array: [{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]`,
    };

    const actionPrompt = actions[action] || actions.summarize;
    const langInstruction = language ? `\nRespond in ${language}.` : "";

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "user", content: `${actionPrompt}${langInstruction}\n\n---\n\n${noteContent}` },
      ],
      max_tokens: this.maxTokens,
      ...(action === "flashcards" || action === "quiz"
        ? { response_format: { type: "json_object" } }
        : {}),
    });

    const content = response.choices[0].message.content;

    if (action === "flashcards" || action === "quiz") {
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new AppError("Failed to parse AI response", 500);
      }
      return { result: parsed, tokens: response.usage?.total_tokens || 0 };
    }

    return { result: content, tokens: response.usage?.total_tokens || 0 };
  }
}

export default new AIService();
