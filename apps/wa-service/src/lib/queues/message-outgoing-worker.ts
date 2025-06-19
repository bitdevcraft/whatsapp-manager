import {
  IJobMessageOutgoing,
  redisConnection,
  WhatsAppEvents,
} from "@workspace/shared";
import { Worker } from "bullmq";
import {
  marketingCampaignsTable,
  MarketingCampaignStatusEnum,
  withTenantTransaction,
} from "@workspace/db";
import { eq } from "drizzle-orm";

// get the tenant api key for whatsapp
// get the marketing_campaign

// identify the contacts to be send using tags.
// add the recipients to be sent into

export const messagesOutgoingWorker = new Worker<IJobMessageOutgoing>(
  WhatsAppEvents.MessagesOutgoing,
  async (job) => {
    const { teamId, marketingCampaignId } = job.data;

    await withTenantTransaction(teamId, async (tx) => {
      await tx
        .update(marketingCampaignsTable)
        .set({ status: MarketingCampaignStatusEnum.Processing })
        .where(eq(marketingCampaignsTable.id, marketingCampaignId));
    });

    console.log(teamId, marketingCampaignId);
  },
  {
    connection: redisConnection,
  },
);
