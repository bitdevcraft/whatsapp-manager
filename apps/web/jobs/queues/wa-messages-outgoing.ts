import { redisConnection } from "@/lib/redis";
import { WhatsAppEvents } from "@workspace/shared";
import { Queue } from "bullmq";

export const waBulkMessagesOutgoingQueue = new Queue(
  WhatsAppEvents.BulkMessagesOutgoing,
  {
    connection: redisConnection,
  }
);
