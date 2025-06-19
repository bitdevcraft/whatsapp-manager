import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const exampleQueue = new Queue("example-queue", {
  connection: redisConnection,
});
