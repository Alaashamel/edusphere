import { Router } from "express";
import {
  createGroup,
  getGroupById,
  getUserGroups,
  joinByCode,
  leaveGroup,
  removeMember,
  addAnnouncement,
  updateGroup,
  deleteGroup,
} from "../controllers/studyGroup.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createGroupSchema,
  joinGroupSchema,
  updateGroupSchema,
  announcementSchema,
} from "../validators/studyGroup.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", getUserGroups);
router.post("/", validate(createGroupSchema), createGroup);
router.post("/join", validate(joinGroupSchema), joinByCode);
router.get("/:id", getGroupById);
router.patch("/:id", validate(updateGroupSchema), updateGroup);
router.delete("/:id", deleteGroup);
router.post("/:id/leave", leaveGroup);
router.delete("/:id/members/:memberId", removeMember);
router.post("/:id/announcements", validate(announcementSchema), addAnnouncement);

export default router;
