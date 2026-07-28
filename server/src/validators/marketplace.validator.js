import { z } from "zod";

export const createItemSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).trim(),
    description: z.string().max(2000).trim().optional(),
    category: z.enum(["book", "notes", "device", "other"]),
    price: z.number().min(0),
    originalPrice: z.number().optional(),
    condition: z.enum(["new", "like-new", "good", "fair", "poor"]).optional(),
    images: z.array(z.string()).optional(),
    course: z.string().optional(),
    isbn: z.string().optional(),
    author: z.string().optional(),
  }),
});

export const updateItemSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(2000).trim().optional(),
    price: z.number().min(0).optional(),
    originalPrice: z.number().optional(),
    condition: z.enum(["new", "like-new", "good", "fair", "poor"]).optional(),
    isAvailable: z.boolean().optional(),
    images: z.array(z.string()).optional(),
  }),
});

export const ratingSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    review: z.string().max(500).optional(),
  }),
});
