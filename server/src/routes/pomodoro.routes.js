import { Router } from "express";
import { logSession, getStats } from "../controllers/pomodoro.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.use(authenticate);
router.post("/log", logSession);
router.get("/stats", getStats);

export default router;
