import { redisConnection } from "@/lib/redis";
import { WhatsAppEvents } from "@workspace/shared";
import { Queue } from "bullmq";

export const waMessagesIncomingQueue = new Queue(
  WhatsAppEvents.MessagesIncoming,
  {
    connection: redisConnection,
  }
);
