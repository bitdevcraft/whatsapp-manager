import { env } from "@/env/server";

export const redisConnection = {
  host: env.REDIS_HOST,
  maxRetriesPerRequest: null,
  password: env.REDIS_PASSWORD,
  port: Number(env.REDIS_PORT),
};
