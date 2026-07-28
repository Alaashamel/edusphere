import { z } from "zod";

const recordSchema = z.object({
  status: z.enum(["present", "absent", "late", "excused"]),
  date: z.coerce.date(),
  lectureTitle: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export const markAttendanceSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID"),
  records: z.array(recordSchema).min(1, "At least one record is required"),
});

export const dateRangeSchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});
