import { Redis } from "ioredis";
import { env } from "~/config/environment";

export const CONNECT_REDIS = () => {
  const redisClient = new Redis({
    password: env.REDIS_PASSWORD,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  });

  // handle redis errors
  redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
  });

  return redisClient;
};

