import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { WhatsAppEvents } from "@workspace/shared";

export const waEventQueue = new Queue(
  WhatsAppEvents.ProcessingBulkMessagesOutgoing,
  {
    connection: redisConnection,
  }
);


