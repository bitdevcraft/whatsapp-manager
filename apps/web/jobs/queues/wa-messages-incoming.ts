import { WhatsAppEvents } from "@workspace/shared";
import { Queue } from "bullmq";

import { redisConnection } from "@/lib/redis";

export const waMessagesIncomingQueue = new Queue(
  WhatsAppEvents.MessagesIncoming,
  {
    connection: redisConnection,
  }
);
