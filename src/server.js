import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { connectRedis } from "../config/redis.js";
import router from "./routes/routes.js";

import path from "path";

dotenv.config();

connectDB();
connectRedis();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
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
