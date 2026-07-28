import { z } from "zod";

export const addEntrySchema = z.object({
  body: z.object({
    courseName: z.string().min(1).max(200).trim(),
    courseCode: z.string().max(20).trim().optional(),
    credits: z.number().min(0.5).max(10),
    grade: z.string().min(1).max(3),
    gradePoints: z.number().min(0).max(4).optional(),
    semester: z.string().min(1).max(20).trim(),
    year: z.number().min(2000).max(2100),
  }),
});

export const updateEntrySchema = z.object({
  body: z.object({
    courseName: z.string().min(1).max(200).trim().optional(),
    courseCode: z.string().max(20).trim().optional(),
    credits: z.number().min(0.5).max(10).optional(),
    grade: z.string().min(1).max(3).optional(),
    gradePoints: z.number().min(0).max(4).optional(),
    semester: z.string().min(1).max(20).trim().optional(),
    year: z.number().min(2000).max(2100).optional(),
  }),
});
