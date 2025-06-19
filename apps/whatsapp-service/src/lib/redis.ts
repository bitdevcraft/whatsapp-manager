import { RedisOptions } from "ioredis";
import { getEnv } from "./env";

export const redisConnection: RedisOptions = {
  host: getEnv("REDIS_HOST"),
  port: Number(getEnv("REDIS_PORT")),
};
