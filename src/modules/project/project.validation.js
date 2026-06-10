import { z } from "zod";

export const projectValidationSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(1, "Project name is required"),

  description: z
    .string()
    .trim()
    .min(1, "Description is required"),

  image: z
    .string()
    .trim()
    .min(1, "Image is required"),

  websiteLink: z
    .string()
    .url("Invalid website URL"),

  categories: z
    .array(z.string())
    .min(1, "At least one category is required"),

});

