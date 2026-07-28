import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["hackathon", "workshop", "study_session", "career_fair", "seminar", "social", "other"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string().max(200).optional(),
  isOnline: z.boolean().optional(),
  meetingUrl: z.string().url().optional(),
  maxParticipants: z.number().int().min(1).optional(),
  tags: z.array(z.string()).optional(),
  image: z.string().url().optional(),
  color: z.string().optional(),
  reminder: z.object({
    enabled: z.boolean(),
    minutesBefore: z.number().int().min(1),
  }).optional(),
});

export const updateEventSchema = createEventSchema.partial();
