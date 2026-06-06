import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.Mongo_URI);

    console.log("MongoDb connected");
  } catch (error) {
    console.error("DB Connection Error: ", error.message);
    process.exit(1);
  }
};

export default connectDB;
