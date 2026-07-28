import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Loader2,
  MessageSquare,
  Sparkles,
  Brain,
  CreditCard,
  FileText,
  Trash2,
  Plus,
  X,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import aiService from "../../../services/ai.service";

const TABS = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "quiz", label: "Quiz", icon: Brain },
  { id: "flashcards", label: "Flashcards", icon: CreditCard },
];

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-500" />
            AI Assistant
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your intelligent academic companion
          </p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-surface rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === tab.id
                ? "bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "chat" && <ChatPanel />}
      {activeTab === "quiz" && <QuizPanel />}
      {activeTab === "flashcards" && <FlashcardPanel />}
    </div>
  );
}

function ChatPanel() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { data: conversations } = useQuery({
    queryKey: ["ai-conversations"],
    queryFn: () => aiService.getConversations({ type: "chat" }).then((r) => r.data.data.conversations),
  });

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = () => {
    if (!input.trim() || isStreaming) return;

    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    const assistantMsg = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    const abort = aiService.chatStream(
      { messages: newMessages.map((m) => ({ role: m.role, content: m.content })), conversationId },
      (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      },
      (tokens) => {
        setIsStreaming(false);
        queryClient.invalidateQueries(["ai-conversations"]);
      },
      (error) => {
        setIsStreaming(false);
        toast.error(error || "AI response failed");
      }
    );

    return () => abort();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    inputRef.current?.focus();
  };

  const loadConversation = async (id) => {
    try {
      const res = await aiService.getConversation(id);
      const conv = res.data.data.conversation;
      setMessages(conv.messages.map((m) => ({ role: m.role, content: m.content })));
      setConversationId(conv._id);
    } catch {
      toast.error("Failed to load conversation");
    }
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await aiService.deleteConversation(id);
      queryClient.invalidateQueries(["ai-conversations"]);
      if (conversationId === id) startNewChat();
      toast.success("Conversation deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-280px)]">
      {/* Sidebar */}
      <div className="hidden lg:block space-y-2">
        <button onClick={startNewChat} className="btn-primary w-full text-sm">
          <Plus className="w-4 h-4" /> New Chat
        </button>
        <div className="space-y-1 max-h-[calc(100vh-380px)] overflow-y-auto">
          {conversations?.map((conv) => (
            <div
              key={conv._id}
              onClick={() => loadConversation(conv._id)}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm group transition-colors
                ${conversationId === conv._id
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                  : "hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-600 dark:text-gray-400"
                }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1">{conv.title || "New conversation"}</span>
              <button
                onClick={(e) => deleteConversation(conv._id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                How can I help you study?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Ask me anything about your courses, request explanations of concepts,
                get help with assignments, or generate study materials.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm
                  ${msg.role === "user"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 dark:bg-dark-surface text-gray-900 dark:text-gray-100"
                  }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.content || (isStreaming && i === messages.length - 1 ? "..." : "")}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              rows={1}
              className="input flex-1 resize-none min-h-[44px] max-h-[120px]"
              disabled={isStreaming}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="btn-primary px-4 h-11"
            >
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizPanel() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const mutation = useMutation({
    mutationFn: aiService.generateQuiz,
    onSuccess: (res) => {
      setQuestions(res.data.data.questions);
      setCurrentQ(0);
      setScore(0);
      setCompleted(false);
      setSelected(null);
      setShowAnswer(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to generate quiz"),
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    mutation.mutate({ topic, numQuestions, difficulty });
  };

  const handleAnswer = (idx) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    if (idx === questions[currentQ].correct) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setCompleted(true);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setScore(0);
    setCompleted(false);
    setSelected(null);
    setShowAnswer(false);
  };

  if (questions.length === 0) {
    return (
      <div className="card max-w-lg mx-auto mt-8">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Generate Quiz</h2>
        </div>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Topic</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Photosynthesis, React Hooks, World War 2"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Questions</label>
              <input
                type="number"
                className="input"
                min={1}
                max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Difficulty</label>
              <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Generate Quiz
          </button>
        </form>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="card max-w-lg mx-auto mt-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quiz Complete!</h2>
        <div className="text-4xl font-bold text-primary-600 mb-2">
          {score} / {questions.length}
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {Math.round((score / questions.length) * 100)}% correct
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="btn-secondary">Retry</button>
          <button onClick={() => setQuestions([])} className="btn-primary">New Quiz</button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="card max-w-lg mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Question {currentQ + 1} / {questions.length}
        </span>
        <span className="text-sm font-medium text-primary-600">Score: {score}</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{q.question}</h3>
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={showAnswer}
            className={`w-full text-left p-3 rounded-lg border text-sm transition-colors
              ${showAnswer && i === q.correct
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : showAnswer && i === selected
                ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                : "border-gray-200 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700"
              }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {showAnswer && (
        <div className="mt-4 space-y-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300">
            <strong>Explanation:</strong> {q.explanation}
          </div>
          <button onClick={nextQuestion} className="btn-primary w-full">
            {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
}

function FlashcardPanel() {
  const [topic, setTopic] = useState("");
  const [numCards, setNumCards] = useState(10);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const mutation = useMutation({
    mutationFn: aiService.generateFlashcards,
    onSuccess: (res) => {
      setCards(res.data.data.cards);
      setCurrentIndex(0);
      setFlipped(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to generate flashcards"),
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    mutation.mutate({ topic, numCards });
  };

  const next = () => {
    setCurrentIndex((i) => (i + 1) % cards.length);
    setFlipped(false);
  };

  const prev = () => {
    setCurrentIndex((i) => (i - 1 + cards.length) % cards.length);
    setFlipped(false);
  };

  if (cards.length === 0) {
    return (
      <div className="card max-w-lg mx-auto mt-8">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Generate Flashcards</h2>
        </div>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Topic</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Cell Biology, JavaScript Closures"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Number of Cards</label>
            <input
              type="number"
              className="input"
              min={1}
              max={50}
              value={numCards}
              onChange={(e) => setNumCards(parseInt(e.target.value))}
            />
          </div>
          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Generate Flashcards
          </button>
        </form>
      </div>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Card {currentIndex + 1} / {cards.length}
        </span>
        <button onClick={() => setCards([])} className="btn-secondary text-sm">
          New Set
        </button>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="card cursor-pointer min-h-[250px] flex items-center justify-center text-center p-8 transition-all hover:shadow-lg"
      >
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
            {flipped ? "Answer" : "Question"}
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {flipped ? card.back : card.front}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">Click to flip</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button onClick={prev} className="btn-secondary">
          Previous
        </button>
        <div className="flex gap-1">
          {cards.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors
                ${i === currentIndex ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"}`}
            />
          ))}
        </div>
        <button onClick={next} className="btn-secondary">
          Next
        </button>
      </div>
    </div>
  );
}
