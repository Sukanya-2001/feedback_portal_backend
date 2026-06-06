import mongoose from "mongoose";

const schema = mongoose.Schema;

const aboutSchema = new schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "aboutus",
  },
);

export default mongoose.model('About',aboutSchema )