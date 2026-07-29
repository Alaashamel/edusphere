import { Router } from "express";
import {
  getAllAnalytics,
  getFocusTime,
  getGpaData,
  getAttendanceData,
  getAssignmentData,
  getCourseData,
} from "../controllers/analytics.controller.js";

const router = Router();

router.get("/", getAllAnalytics);
router.get("/focus", getFocusTime);
router.get("/gpa", getGpaData);
router.get("/attendance", getAttendanceData);
router.get("/assignments", getAssignmentData);
router.get("/courses", getCourseData);

export default router;
