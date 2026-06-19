import { z } from "zod";
import mongoose from "mongoose";

export const feedbackValidation = z.object({
  projectId: z
    .string()
    .refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid project ID",
    }),

  guestName: z
    .string()
    .trim()
    .min(1, "User name is required")
    .optional(),

  guestEmail: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .optional(),

  feedback: z
    .string()
    .trim()
    .min(1, "Feedback is required"),

  reply: z
    .object({
      comment: z.string().trim().optional(),

      created_at: z
        .string()
        .datetime("Invalid date format")
        .optional(),
    })
    .optional(),

  isSaved: z.boolean().optional(),

  isDeleted: z.boolean().optional(),
});