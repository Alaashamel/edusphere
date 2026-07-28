import { Router } from "express";
import { getTracker, addEntry, removeEntry, updateEntry, getStats, setTargetGpa } from "../controllers/gpa.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { addEntrySchema, updateEntrySchema } from "../validators/gpa.validator.js";

const router = Router();

router.use(authenticate);
router.get("/", getTracker);
router.get("/stats", getStats);
router.post("/entries", validate(addEntrySchema), addEntry);
router.patch("/entries/:index", validate(updateEntrySchema), updateEntry);
router.delete("/entries/:index", removeEntry);
router.post("/target", setTargetGpa);

export default router;
