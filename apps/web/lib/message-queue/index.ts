import { Queue, JobsOptions } from "bullmq";

// 1) Redis connection options (must have maxRetriesPerRequest=null)
const redisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

// 2) Define the queue with sane defaults
const defaultJobOptions: JobsOptions = {
  removeOnComplete: { age: 3600 }, // keep success history 1 h
  removeOnFail: false, // keep failures
  attempts: 3, // retry up to 3×
  backoff: { type: "exponential", delay: 1000 },
};

const queueName = "whatsapp-jobs";
export const whatsappQueue = new Queue(queueName, {
  connection: redisOptions,
  defaultJobOptions,
});
