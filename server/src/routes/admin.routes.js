import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/admin.js";
import {
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  getModerationQueue,
  moderateContent,
  getActivityLog,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/stats", getDashboardStats);
router.get("/users", getUsers);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/moderation", getModerationQueue);
router.post("/moderate", moderateContent);
router.get("/activity", getActivityLog);

export default router;
