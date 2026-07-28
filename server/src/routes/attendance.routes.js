import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import {
  markAttendance,
  removeAttendanceRecord,
  getAttendanceByCourse,
  getAllAttendance,
  getStats,
  getAttendanceByDateRange,
} from "../controllers/attendance.controller.js";
import { markAttendanceSchema, dateRangeSchema } from "../validators/attendance.validator.js";

const router = Router();

router.get("/stats", getStats);
router.get("/range", validate(dateRangeSchema, "query"), getAttendanceByDateRange);
router.get("/", getAllAttendance);
router.get("/course/:courseId", getAttendanceByCourse);
router.post("/", validate(markAttendanceSchema), markAttendance);
router.delete("/:courseId/:date", removeAttendanceRecord);

export default router;
