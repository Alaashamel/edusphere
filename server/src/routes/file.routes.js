import { Router } from "express";
import multer from "multer";
import { validate } from "../middlewares/validate.js";
import {
  uploadFile,
  uploadNewVersion,
  getFiles,
  getSharedWithMe,
  getFileById,
  moveFile,
  renameFile,
  toggleStar,
  addTags,
  removeTag,
  shareFile,
  removeShare,
  downloadFile,
  softDelete,
  restoreFile,
  getTrash,
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder,
  getStorageStats,
} from "../controllers/file.controller.js";
import {
  renameFileSchema,
  addTagsSchema,
  shareFileSchema,
  moveFileSchema,
  createFolderSchema,
  renameFolderSchema,
} from "../validators/file.validator.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.get("/stats", getStorageStats);
router.get("/trash", getTrash);
router.get("/shared", getSharedWithMe);
router.get("/", getFiles);
router.get("/:id", getFileById);

router.post("/upload", upload.single("file"), validate(uploadFileSchema), uploadFile);
router.post("/:id/version", upload.single("file"), uploadNewVersion);
router.post("/folders", validate(createFolderSchema), createFolder);
router.get("/folders/list", getFolders);

router.patch("/:id/rename", validate(renameFileSchema), renameFile);
router.patch("/:id/move", validate(moveFileSchema), moveFile);
router.patch("/:id/star", toggleStar);
router.patch("/:id/tags", validate(addTagsSchema), addTags);
router.delete("/:id/tags/:tag", removeTag);
router.patch("/:id/share", validate(shareFileSchema), shareFile);
router.delete("/:id/share/:userId", removeShare);
router.patch("/:id/restore", restoreFile);

router.delete("/:id", softDelete);
router.delete("/folders/:id", deleteFolder);
router.patch("/folders/:id/rename", validate(renameFolderSchema), renameFolder);

export default router;
