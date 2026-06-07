import { z } from "zod";

export const changePassValidationSchema = z.object({
  old_password: z.string().min(1, "Password is required"),

  new_password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});


