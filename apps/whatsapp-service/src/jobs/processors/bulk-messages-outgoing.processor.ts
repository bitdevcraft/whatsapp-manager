import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { ioInstance } from "@/socket";
import { socketRegistry } from "@/socket";
import { IJobMessageOutgoing, WhatsAppEvents } from "@workspace/shared";
import {
  marketingCampaignsTable,
  MarketingCampaignStatusEnum,
  withTenantTransaction,
} from "@workspace/db";
import { eq } from "drizzle-orm";

export function setupBulkMessagesOutgoingWorker() {
  const worker = new Worker<IJobMessageOutgoing>(
    WhatsAppEvents.BulkMessagesOutgoing,
    async (job) => {
      console.log("Processing job:", job.id, job.data);
      const { teamId, marketingCampaignId } = job.data;

      await updateMarketingCampaignStatus(
        marketingCampaignId,
        MarketingCampaignStatusEnum.Processing,
        teamId
      );
    },
    { connection: redisConnection }
  );

  worker.on("completed", async (job) => {
    const { teamId, marketingCampaignId } = job.data;

    const socketId = socketRegistry.getSocketId(teamId);
    await updateMarketingCampaignStatus(
      marketingCampaignId,
      MarketingCampaignStatusEnum.Success,
      teamId
    );

    if (socketId) {
      ioInstance.to(socketId).emit("job:completed", {
        jobId: job.id,
        message: "Job completed successfully",
      });
    }
  });

  worker.on("failed", async (job, err) => {
    if (!job) {
      return;
    }

    const { teamId, marketingCampaignId } = job.data;

    const socketId = socketRegistry.getSocketId(teamId);

    await updateMarketingCampaignStatus(
      marketingCampaignId,
      MarketingCampaignStatusEnum.Failed,
      teamId
    );

    if (socketId) {
      ioInstance.to(socketId).emit("job:failed", {
        jobId: job?.id,
        error: err.message,
      });
    }
  });
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
