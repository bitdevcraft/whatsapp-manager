import { JobsOptions, Queue } from "bullmq";

import { env } from "@/env/server";

// 1) Redis connection options (must have maxRetriesPerRequest=null)
const redisOptions = {
  host: env.REDIS_HOST,
  maxRetriesPerRequest: null,
  password: env.REDIS_PASSWORD,
  port: Number(env.REDIS_PORT),
};

// 2) Define the queue with sane defaults
const defaultJobOptions: JobsOptions = {
  attempts: 3, // retry up to 3×
  backoff: { delay: 1000, type: "exponential" },
  removeOnComplete: { age: 3600 }, // keep success history 1h
  removeOnFail: false, // keep failures
};

const queueName = "whatsapp-jobs";
export const whatsappQueue = new Queue(queueName, {
  connection: redisOptions,
  defaultJobOptions,
});
