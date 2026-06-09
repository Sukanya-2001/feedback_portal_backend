import { z } from "zod";
import mongoose from "mongoose";

export const feedbackValidation = z.object({
  project_id: z
    .string()
    .refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid project ID",
    }),

  user_name: z
    .string()
    .trim()
    .min(1, "User name is required")
    .optional(),

  guest_email: z
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