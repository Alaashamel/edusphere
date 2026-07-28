import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getUpcoming,
  getCalendarEvents,
} from "../controllers/event.controller.js";
import { createEventSchema, updateEventSchema } from "../validators/event.validator.js";

const router = Router();

router.get("/upcoming", getUpcoming);
router.get("/calendar", getCalendarEvents);
router.get("/my", getMyEvents);
router.get("/", getEvents);
router.get("/:id", getEventById);

router.post("/", validate(createEventSchema), createEvent);
router.post("/:id/register", registerForEvent);
router.post("/:id/cancel", cancelRegistration);

router.patch("/:id", validate(updateEventSchema), updateEvent);
router.delete("/:id", deleteEvent);

export default router;
