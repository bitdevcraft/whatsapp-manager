import { WhatsAppEvents } from "@workspace/shared";
import { Queue } from "bullmq";

import { redisConnection } from "@/lib/redis";

export const waEventQueue = new Queue(
  WhatsAppEvents.ProcessingBulkMessagesOutgoing,
  {
    connection: redisConnection,
  }
);
