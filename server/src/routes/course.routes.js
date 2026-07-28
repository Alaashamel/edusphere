import { Router } from "express";
import {
  createCourse,
  getCourseById,
  getUserCourses,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  createLecture,
  getCourseLectures,
  updateLecture,
  deleteLecture,
} from "../controllers/course.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import {
  createCourseSchema,
  updateCourseSchema,
  createLectureSchema,
  getCoursesQuerySchema,
} from "../validators/course.validator.js";

const router = Router();

// Courses
router.get("/", authenticate, validate(getCoursesQuerySchema), getUserCourses);
router.post("/", authenticate, validate(createCourseSchema), createCourse);
router.get("/:id", authenticate, getCourseById);
router.patch("/:id", authenticate, validate(updateCourseSchema), updateCourse);
router.delete("/:id", authenticate, deleteCourse);

// Enrollment
router.post("/:id/enroll", authenticate, enrollInCourse);
router.post("/:id/unenroll", authenticate, unenrollFromCourse);

// Lectures
router.get("/:id/lectures", authenticate, getCourseLectures);
router.post("/:id/lectures", authenticate, validate(createLectureSchema), createLecture);
router.patch("/lectures/:lectureId", authenticate, updateLecture);
router.delete("/lectures/:lectureId", authenticate, deleteLecture);

export default router;
