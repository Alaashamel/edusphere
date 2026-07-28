import { z } from "zod";

export const createAssignmentSchema = z.object({
  body: z.object({
    course: z.string().min(1),
    title: z.string().min(1).max(200).trim(),
    description: z.string().max(5000).trim().optional(),
    dueDate: z.string().datetime(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    maxPoints: z.number().min(0).optional(),
    attachments: z
      .array(
        z.object({
          name: z.string(),
          url: z.string(),
          type: z.string(),
          size: z.number(),
        })
      )
      .optional(),
    estimatedDifficulty: z.enum(["easy", "medium", "hard", "very_hard"]).optional(),
    estimatedTime: z.number().optional(),
  }),
});

export const updateAssignmentSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(5000).trim().optional(),
    dueDate: z.string().datetime().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    maxPoints: z.number().min(0).optional(),
    estimatedDifficulty: z.enum(["easy", "medium", "hard", "very_hard"]).optional(),
    estimatedTime: z.number().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const submitAssignmentSchema = z.object({
  body: z.object({
    content: z.string().optional(),
    files: z
      .array(
        z.object({
          name: z.string(),
          url: z.string(),
          type: z.string(),
          size: z.number(),
        })
      )
      .optional(),
  }),
});

export const gradeAssignmentSchema = z.object({
  body: z.object({
    points: z.number().min(0),
    letterGrade: z.string().optional(),
    feedback: z.string().optional(),
  }),
});

export const getAssignmentsQuerySchema = z.object({
  query: z.object({
    status: z.enum(["pending", "in_progress", "submitted", "graded", "returned"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    courseId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
