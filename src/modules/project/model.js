import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: {
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

    websiteLink: {
      type: String,
      required: true,
      trim: true,
    },

    categories: {
      type: [String],
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "projects",
  }
);

export default mongoose.model("Project", projectSchema);