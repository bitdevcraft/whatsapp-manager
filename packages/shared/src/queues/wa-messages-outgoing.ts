import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";
import { WhatsAppEvents } from "../events/whatsapp";

export const waMessagesOutgoingQueue = new Queue(
  WhatsAppEvents.MessagesOutgoing,
  {
    connection: redisConnection,
  }
);
