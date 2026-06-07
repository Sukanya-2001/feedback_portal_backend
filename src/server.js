import express from "express";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { connectRedis } from "../config/redis.js";
import router from "./routes/routes.js";

dotenv.config();

connectDB();
connectRedis();

const app = express();

app.use(express.json());
app.use("/api", router);

app.get("/", (req, res) => {
  res.json({
    message: "API Working",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
