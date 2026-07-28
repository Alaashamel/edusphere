import api from "./api";

const courseService = {
  getAll: (params) => api.get("/courses", { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post("/courses", data),
  update: (id, data) => api.patch(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  unenroll: (id) => api.post(`/courses/${id}/unenroll`),
  getLectures: (id) => api.get(`/courses/${id}/lectures`),
  createLecture: (courseId, data) => api.post(`/courses/${courseId}/lectures`, data),
  updateLecture: (lectureId, data) => api.patch(`/courses/lectures/${lectureId}`, data),
  deleteLecture: (lectureId) => api.delete(`/courses/lectures/${lectureId}`),
};

export default courseService;
