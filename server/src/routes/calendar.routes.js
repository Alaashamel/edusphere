import { Router } from "express";
import {
  createEvent,
  getEventById,
  getUserEvents,
  updateEvent,
  deleteEvent,
  getTodayEvents,
  getUpcomingEvents,
} from "../controllers/calendar.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createEventSchema,
  updateEventSchema,
  getEventsQuerySchema,
} from "../validators/calendar.validator.js";

const router = Router();

router.get("/", authenticate, validate(getEventsQuerySchema), getUserEvents);
router.get("/today", authenticate, getTodayEvents);
router.get("/upcoming", authenticate, getUpcomingEvents);
router.post("/", authenticate, validate(createEventSchema), createEvent);
router.get("/:id", authenticate, getEventById);
router.patch("/:id", authenticate, validate(updateEventSchema), updateEvent);
router.delete("/:id", authenticate, deleteEvent);

export default router;
