import { Router } from "express";
import {
  createNote,
  getNoteById,
  getUserNotes,
  updateNote,
  deleteNote,
  getNoteVersions,
  getAllTags,
  createFolder,
  getUserFolders,
  updateFolder,
  deleteFolder,
} from "../controllers/note.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createNoteSchema,
  updateNoteSchema,
  getNotesQuerySchema,
  createFolderSchema,
  updateFolderSchema,
} from "../validators/note.validator.js";

const router = Router();

// Notes
router.get("/notes", authenticate, validate(getNotesQuerySchema), getUserNotes);
router.post("/notes", authenticate, validate(createNoteSchema), createNote);
router.get("/notes/tags", authenticate, getAllTags);
router.get("/notes/:id", authenticate, getNoteById);
router.patch("/notes/:id", authenticate, validate(updateNoteSchema), updateNote);
router.delete("/notes/:id", authenticate, deleteNote);
router.get("/notes/:id/versions", authenticate, getNoteVersions);

// Folders
router.get("/folders", authenticate, getUserFolders);
router.post("/folders", authenticate, validate(createFolderSchema), createFolder);
router.patch("/folders/:id", authenticate, validate(updateFolderSchema), updateFolder);
router.delete("/folders/:id", authenticate, deleteFolder);

export default router;
