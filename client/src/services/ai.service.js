import api from "./api";

const aiService = {
  chat: (data) => api.post("/ai/chat", data),
  chatStream: (data, onChunk, onDone, onError) => {
    const abortController = new AbortController();

    fetch(`${api.defaults.baseURL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({ ...data, stream: true }),
      signal: abortController.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Chat request failed");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const processStream = () =>
          reader.read().then(({ done, value }) => {
            if (done) return;
            const text = decoder.decode(value, { stream: true });
            const lines = text.split("\n").filter((l) => l.startsWith("data: "));
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.done) {
                  onDone(parsed.tokens);
                } else if (parsed.error) {
                  onError(parsed.error);
                } else if (parsed.content) {
                  onChunk(parsed.content);
                }
              } catch {
                // skip malformed lines
              }
            }
            return processStream();
          });

        return processStream();
      })
      .catch((err) => {
        if (err.name !== "AbortError") onError(err.message);
      });

    return () => abortController.abort();
  },
  generateQuiz: (data) => api.post("/ai/quiz", data),
  generateFlashcards: (data) => api.post("/ai/flashcards", data),
  assistNote: (data) => api.post("/ai/note-assist", data),
  getConversations: (params) => api.get("/ai/conversations", { params }),
  getConversation: (id) => api.get(`/ai/conversations/${id}`),
  deleteConversation: (id) => api.delete(`/ai/conversations/${id}`),
};

export default aiService;
