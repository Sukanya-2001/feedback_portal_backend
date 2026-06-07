import { z } from "zod";

export const projectValidationSchema = z.object({
  project_name: z
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

  website_link: z
    .string()
    .url("Invalid website URL"),

  categories: z
    .array(z.string())
    .min(1, "At least one category is required"),

});
