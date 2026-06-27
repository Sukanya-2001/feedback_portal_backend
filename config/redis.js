import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis(
  process.env.REDIS_URL || "redis://127.0.0.1:6379",
);
redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", (err) => {
  console.error("Redis Connection Error:", err.message);
});

const connectRedis = async () => {
  // ioredis connects automatically. We export this function to maintain compatibility.
};

export { redisClient, connectRedis };
