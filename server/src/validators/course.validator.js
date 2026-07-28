import { z } from "zod";

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).trim(),
    description: z.string().max(2000).trim().optional(),
    code: z.string().min(1).max(20).trim().toUpperCase(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: z.string().optional(),
    instructor: z.string().optional(),
    semester: z.enum(["Fall", "Spring", "Summer", "Winter"]),
    year: z.number().min(2020).max(2030),
    tags: z.array(z.string()).optional(),
    maxStudents: z.number().min(0).optional(),
    syllabus: z.string().optional(),
  }),
});

export const updateCourseSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(2000).trim().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: z.string().optional(),
    semester: z.enum(["Fall", "Spring", "Summer", "Winter"]).optional(),
    year: z.number().min(2020).max(2030).optional(),
    tags: z.array(z.string()).optional(),
    maxStudents: z.number().min(0).optional(),
    syllabus: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createLectureSchema = z.object({
  body: z.object({
    course: z.string().min(1),
    title: z.string().min(1).max(200).trim(),
    description: z.string().max(1000).trim().optional(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    location: z.string().trim().optional(),
    materials: z
      .array(
        z.object({
          title: z.string(),
          url: z.string(),
          type: z.enum(["pdf", "video", "link", "file"]),
        })
      )
      .optional(),
    isRecurring: z.boolean().optional(),
  }),
});

export const getCoursesQuerySchema = z.object({
  query: z.object({
    semester: z.enum(["Fall", "Spring", "Summer", "Winter"]).optional(),
    year: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
