import slugify from "slugify";
import { randomUUID } from "crypto";

export const generateSlug = (projectName) => {
  const slug = slugify(projectName, {
    lower: true,
    strict: true,
    trim: true,
  });

  const uniquePart = randomUUID().slice(0, 8);

  return `${slug}-${uniquePart}`;
};
