import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";
import { WhatsAppEvents } from "../events/whatsapp";

export const waMessagesIncomingQueue = new Queue(
  WhatsAppEvents.MessagesIncoming,
  {
    connection: redisConnection,
  }
);
