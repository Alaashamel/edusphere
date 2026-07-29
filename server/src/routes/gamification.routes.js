import { Router } from "express";
import { getStats, checkIn, getLeaderboard, getBadges } from "../controllers/gamification.controller.js";

const router = Router();

router.get("/stats", getStats);
router.get("/leaderboard", getLeaderboard);
router.get("/badges", getBadges);
router.post("/checkin", checkIn);

export default router;
