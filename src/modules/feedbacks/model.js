import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    feedback: {
      type: String,
      required: true,
      trim: true,
    },
    reply: {
      comment: {
        type: String,
        trim: true,
      },

      created_at: {
        type: Date,
      },
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "feedbacks",
  },
);

export default mongoose.model("Feedback", feedbackSchema);
