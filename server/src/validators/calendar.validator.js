import { z } from "zod";

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).trim(),
    description: z.string().max(2000).trim().optional(),
    start: z.string().datetime(),
    end: z.string().datetime(),
    allDay: z.boolean().optional(),
    type: z.enum(["class", "exam", "deadline", "reminder", "study", "custom"]).optional(),
    course: z.string().optional(),
    color: z.string().optional(),
    location: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurrence: z
      .object({
        frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
        interval: z.number().min(1).optional(),
        endDate: z.string().datetime().optional(),
        count: z.number().optional(),
      })
      .optional(),
    reminders: z
      .array(
        z.object({
          type: z.enum(["popup", "email"]).optional(),
          minutes: z.number().min(0).optional(),
        })
      )
      .optional(),
    attendees: z.array(z.string()).optional(),
  }),
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(2000).trim().optional(),
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
    allDay: z.boolean().optional(),
    type: z.enum(["class", "exam", "deadline", "reminder", "study", "custom"]).optional(),
    course: z.string().nullable().optional(),
    color: z.string().optional(),
    location: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurrence: z.any().optional(),
    reminders: z.any().optional(),
    attendees: z.array(z.string()).optional(),
  }),
});

export const getEventsQuerySchema = z.object({
  query: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
    type: z.enum(["class", "exam", "deadline", "reminder", "study", "custom"]).optional(),
    courseId: z.string().optional(),
  }),
});
