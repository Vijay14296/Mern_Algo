import IORedis from "ioredis";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

connection.on("connect", () => console.log("✅ Connected to Redis"));
connection.on("error", (err) => console.error("❌ Redis connection error:", err));

export default connection;
