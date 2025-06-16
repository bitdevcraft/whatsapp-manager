import {
  IJobMessageOutgoing,
  redisConnection,
  WhatsAppEvents,
} from "@workspace/shared";
import { Worker } from "bullmq";

// get the tenant api key for whatsapp
// get the marketing_campaign

// identify the contacts to be send using tags.
// add the recipients to be sent into

export const messagesOutgoingWorker = new Worker<IJobMessageOutgoing>(
  WhatsAppEvents.MessagesOutgoing,
  async (job) => {
    const { teamId, marketingCampaignId } = job.data;

    console.log(teamId, marketingCampaignId);
  },
  {
    connection: redisConnection,
  }
);
