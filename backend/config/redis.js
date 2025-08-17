import IORedis from "ioredis";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "redis-18782.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: process.env.REDIS_PORT || 18782,
  username: process.env.REDIS_USERNAME || "default", // your Redis Labs username
  password: process.env.REDIS_PASSWORD || "r3vwEqcQRNczGXTgJY2CFh26TS8ySnfw", // your actual Redis password
  tls: undefined, // enable TLS for cloud Redis

  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

connection.on("connect", () => console.log("✅ Connected to Redis"));
connection.on("error", (err) => console.error("❌ Redis connection error:", err));

export default connection;
