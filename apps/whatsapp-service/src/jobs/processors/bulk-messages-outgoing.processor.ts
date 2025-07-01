import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { ioInstance } from "@/socket";
import { socketRegistry } from "@/socket";
import {
  IJobMessageOutgoing,
  NotificationEvent,
  NotificationRelatedObject,
  WhatsAppEvents,
} from "@workspace/shared";
import {
  marketingCampaignsTable,
  MarketingCampaignStatusEnum,
  withTenantTransaction,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { processOutgoingMarketingCampaign } from "@/app/whatsapp/services/processors/bulk-messages";

export function setupBulkMessagesOutgoingWorker() {
  const worker = new Worker<IJobMessageOutgoing>(
    WhatsAppEvents.BulkMessagesOutgoing,
    async (job) => {
      console.log("Processing job:", job.id, job.data);
      const { teamId, marketingCampaignId, userId } = job.data;

      await processOutgoingMarketingCampaign(
        marketingCampaignId,
        teamId,
        userId
      );

      await updateMarketingCampaignStatus(
        marketingCampaignId,
        MarketingCampaignStatusEnum.Processing,
        teamId
      );

      const socketId = socketRegistry.getSocketId(userId);

      if (socketId) {
        ioInstance
          .to(`team:${teamId}`)
          .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
            jobId: job.id,
            payload: {
              message: "Campaign Processed",
              data: {},
            },
            userId,
            teamId,
            relatedId: marketingCampaignId,
            relatedObject: NotificationRelatedObject.MarketingCampaign,
          });
      }
    },
    { connection: redisConnection }
  );

  worker.on("completed", async (job) => {
    const { teamId, marketingCampaignId, userId } = job.data;

    await updateMarketingCampaignStatus(
      marketingCampaignId,
      MarketingCampaignStatusEnum.Success,
      teamId
    );

    const socketId = socketRegistry.getSocketId(userId);

    if (socketId) {
      ioInstance
        .to(`team:${teamId}`)
        .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
          jobId: job.id,
          payload: {
            message: "Campaign Success",
            data: {},
          },
          userId,
          teamId,
          relatedId: marketingCampaignId,
          relatedObject: NotificationRelatedObject.MarketingCampaign,
        });
    }
  });

  worker.on("failed", async (job, err) => {
    if (!job) {
      return;
    }

    const { teamId, marketingCampaignId, userId } = job.data;

    const socketId = socketRegistry.getSocketId(userId);

    await updateMarketingCampaignStatus(
      marketingCampaignId,
      MarketingCampaignStatusEnum.Failed,
      teamId
    );

    if (socketId) {
      ioInstance
        .to(`team:${teamId}`)
        .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
          jobId: job.id!, // if `job.id` is possibly undefined, make sure it's not
          payload: {
            message: "Campaign Failed",
          },
          userId,
          teamId,
          error: err,
          relatedId: marketingCampaignId,
          relatedObject: NotificationRelatedObject.MarketingCampaign,
        });
    }
  });

  return worker;
}

async function updateMarketingCampaignStatus(
  id: string,
  status: MarketingCampaignStatusEnum,
  teamId: string
) {
  await withTenantTransaction(teamId, async (tx) => {
    await tx
      .update(marketingCampaignsTable)
      .set({ status: status })
      .where(eq(marketingCampaignsTable.id, id));
  });
}
