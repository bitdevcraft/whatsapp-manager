import {
  marketingCampaignsTable,
  MarketingCampaignStatusEnum,
  withTenantTransaction,
} from "@workspace/db";
import {
  IJobMessageOutgoing,
  NotificationEvent,
  NotificationRelatedObject,
  WhatsAppEvents,
} from "@workspace/shared";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { processOutgoingMarketingCampaign } from "@/app/whatsapp/services/processors/bulk-messages";
import { redisConnection } from "@/lib/redis";
import { ioInstance } from "@/socket";
import { socketRegistry } from "@/socket";

export function setupBulkMessagesOutgoingWorker() {
  const worker = new Worker<IJobMessageOutgoing>(
    WhatsAppEvents.BulkMessagesOutgoing,
    async (job) => {
      const { marketingCampaignId, teamId, userId } = job.data;

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
              data: {},
              message: "Campaign Processed",
            },
            relatedId: marketingCampaignId,
            relatedObject: NotificationRelatedObject.MarketingCampaign,
            teamId,
            userId,
          });
      }
    },
    { connection: redisConnection }
  );

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  worker.on("completed", async (job) => {
    const { marketingCampaignId, teamId, userId } = job.data;

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
            data: {},
            message: "Campaign Success",
          },
          relatedId: marketingCampaignId,
          relatedObject: NotificationRelatedObject.MarketingCampaign,
          teamId,
          userId,
        });
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  worker.on("failed", async (job, err) => {
    if (!job) {
      return;
    }

    const { marketingCampaignId, teamId, userId } = job.data;

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
          error: err,
          jobId: job.id, // if `job.id` is possibly undefined, make sure it's not
          payload: {
            message: "Campaign Failed",
          },
          relatedId: marketingCampaignId,
          relatedObject: NotificationRelatedObject.MarketingCampaign,
          teamId,
          userId,
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
