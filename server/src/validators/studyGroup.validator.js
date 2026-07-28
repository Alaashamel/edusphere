import { z } from "zod";

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).trim(),
    description: z.string().max(1000).trim().optional(),
    course: z.string().optional(),
    color: z.string().optional(),
    maxMembers: z.number().min(2).max(50).optional(),
  }),
});

export const joinGroupSchema = z.object({
  body: z.object({
    inviteCode: z.string().min(1),
  }),
});

export const updateGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).trim().optional(),
    description: z.string().max(1000).trim().optional(),
    color: z.string().optional(),
    meetingLink: z.string().url().optional().or(z.literal("")),
    maxMembers: z.number().min(2).max(50).optional(),
    isArchived: z.boolean().optional(),
  }),
});

export const announcementSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).trim(),
    content: z.string().min(1).max(2000).trim(),
  }),
});
