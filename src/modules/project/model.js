import { z } from "zod";
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    project_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "project",
  },
);

export default mongoose.model("project", projectSchema);
