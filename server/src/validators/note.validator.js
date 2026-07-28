import { z } from "zod";

export const createNoteSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300).trim(),
    content: z.string().optional(),
    contentJson: z.any().optional(),
    folder: z.string().optional(),
    course: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateNoteSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300).trim().optional(),
    content: z.string().optional(),
    contentJson: z.any().optional(),
    folder: z.string().nullable().optional(),
    course: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    isPinned: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    attachments: z
      .array(z.object({ name: z.string(), url: z.string(), type: z.string(), size: z.number() }))
      .optional(),
  }),
});

export const getNotesQuerySchema = z.object({
  query: z.object({
    folderId: z.string().optional(),
    courseId: z.string().optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    isPinned: z.string().optional(),
    isArchived: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const createFolderSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).trim(),
    parent: z.string().optional(),
    course: z.string().optional(),
    color: z.string().optional(),
  }),
});

export const updateFolderSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).trim().optional(),
    color: z.string().optional(),
  }),
});
