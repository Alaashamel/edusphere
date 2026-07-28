import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300).trim(),
    content: z.string().min(1).max(10000),
    type: z.enum(["discussion", "question", "announcement"]).optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    course: z.string().optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(300).trim().optional(),
    content: z.string().min(1).max(10000).optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
  }),
});

export const commentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(5000),
    parentComment: z.string().optional(),
  }),
});

export const voteSchema = z.object({
  body: z.object({
    direction: z.enum(["up", "down"]),
  }),
});

export const postsQuerySchema = z.object({
  query: z.object({
    type: z.enum(["discussion", "question", "announcement"]).optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(["new", "top", "trending"]).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
