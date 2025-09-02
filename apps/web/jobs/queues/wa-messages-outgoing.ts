import { WhatsAppEvents } from "@workspace/shared";
import { Queue } from "bullmq";

import { redisConnection } from "@/lib/redis";

export const waBulkMessagesOutgoingQueue = new Queue(
  WhatsAppEvents.BulkMessagesOutgoing,
  {
    connection: redisConnection,
  }
);
