import api from "./api";

const gpaService = {
  getTracker: () => api.get("/gpa"),
  getStats: () => api.get("/gpa/stats"),
  addEntry: (data) => api.post("/gpa/entries", data),
  updateEntry: (index, data) => api.patch(`/gpa/entries/${index}`, data),
  removeEntry: (index) => api.delete(`/gpa/entries/${index}`),
  setTargetGpa: (targetGpa) => api.post("/gpa/target", { targetGpa }),
};

export default gpaService;
