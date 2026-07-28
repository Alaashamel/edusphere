import { Router } from "express";
import {
  createAssignment,
  getAssignmentById,
  getUserAssignments,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeAssignment,
  getOverdueAssignments,
  getUpcomingAssignments,
} from "../controllers/assignment.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  submitAssignmentSchema,
  gradeAssignmentSchema,
  getAssignmentsQuerySchema,
} from "../validators/assignment.validator.js";

const router = Router();

router.get("/", authenticate, validate(getAssignmentsQuerySchema), getUserAssignments);
router.get("/overdue", authenticate, getOverdueAssignments);
router.get("/upcoming", authenticate, getUpcomingAssignments);
router.post("/", authenticate, validate(createAssignmentSchema), createAssignment);
router.get("/:id", authenticate, getAssignmentById);
router.patch("/:id", authenticate, validate(updateAssignmentSchema), updateAssignment);
router.delete("/:id", authenticate, deleteAssignment);
router.post("/:id/submit", authenticate, validate(submitAssignmentSchema), submitAssignment);
router.post("/:id/grade", authenticate, validate(gradeAssignmentSchema), gradeAssignment);

export default router;
