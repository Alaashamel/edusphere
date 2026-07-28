import { z } from "zod";

export const uploadFileSchema = z.object({
  folder: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});

export const renameFileSchema = z.object({
  name: z.string().min(1).max(255),
});

export const addTagsSchema = z.object({
  tags: z.array(z.string().min(1).max(50)).min(1),
});

export const shareFileSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  permission: z.enum(["view", "edit"]),
});

export const moveFileSchema = z.object({
  folderId: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable(),
});

export const createFolderSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});

export const renameFolderSchema = z.object({
  name: z.string().min(1).max(100),
});
