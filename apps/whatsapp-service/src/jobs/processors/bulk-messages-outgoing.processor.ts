import {
  campaignErrorLogsTable,
  CampaignErrorType,
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
import { Worker, Job } from "bullmq";
import { eq } from "drizzle-orm";

import { createCampaignLogger } from "@/lib/logger";
import { redisConnection } from "@/lib/redis";
import { ioInstance } from "@/socket";
import { socketRegistry } from "@/socket";
import { processOutgoingMarketingCampaign } from "@/app/whatsapp/services/processors/bulk-messages";

function classifyError(error: Error | unknown): CampaignErrorType {
  const err = error instanceof Error ? error : new Error(String(error));
  const message = err.message.toLowerCase();

  if (message.includes("network") || message.includes("econnrefused") || message.includes("timeout")) {
    return CampaignErrorType.NETWORK_ERROR;
  }
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return CampaignErrorType.RATE_LIMIT;
  }
  if (message.includes("auth") || message.includes("unauthorized") || message.includes("token")) {
    return CampaignErrorType.AUTH_ERROR;
  }
  if (message.includes("template") || message.includes("invalid template")) {
    return CampaignErrorType.TEMPLATE_ERROR;
  }
  if (message.includes("recipient") || message.includes("phone") || message.includes("invalid number")) {
    return CampaignErrorType.INVALID_RECIPIENT;
  }
  if (message.includes("database") || message.includes("sql")) {
    return CampaignErrorType.DATABASE_ERROR;
  }
  if (message.includes("whatsapp") || message.includes("facebook") || message.includes("meta")) {
    return CampaignErrorType.WHATSAPP_API_ERROR;
  }

  return CampaignErrorType.UNKNOWN_ERROR;
}

async function logCampaignError(
  teamId: string,
  marketingCampaignId: string,
  error: Error | unknown,
  errorType: CampaignErrorType
) {
  try {
    await withTenantTransaction(teamId, async (tx) => {
      await tx.insert(campaignErrorLogsTable).values({
        marketingCampaignId,
        teamId,
        errorType,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : null,
        jobData: { campaignLevel: true },
      });
    });
  } catch (logError) {
    console.error("Failed to log campaign error:", logError);
  }
}

export function setupBulkMessagesOutgoingWorker() {
  const worker = new Worker<IJobMessageOutgoing>(
    WhatsAppEvents.BulkMessagesOutgoing,
    async (job: Job<IJobMessageOutgoing>) => {
      const { marketingCampaignId, teamId, userId } = job.data;

      const campaignLogger = createCampaignLogger({
        marketingCampaignId,
        teamId,
        userId,
        jobId: job.id,
      });

      campaignLogger.info("Starting campaign processing");

      try {
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

        campaignLogger.info("Campaign queued for processing");

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
      } catch (error) {
        const errorType = classifyError(error);

        campaignLogger.error("Campaign processing failed", error, {
          errorType,
        });

        // Log error to database
        await logCampaignError(
          teamId,
          marketingCampaignId,
          error,
          errorType
        );

        throw error;
      }
    },
    { connection: redisConnection }
  );

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  worker.on("completed", async (job) => {
    const { marketingCampaignId, teamId, userId } = job.data;

    const campaignLogger = createCampaignLogger({
      marketingCampaignId,
      teamId,
      userId,
      jobId: job?.id,
    });

    campaignLogger.info("Campaign completed successfully");

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
      console.error("Job is undefined in failed handler", err);
      return;
    }

    const { marketingCampaignId, teamId, userId } = job.data;

    const campaignLogger = createCampaignLogger({
      marketingCampaignId,
      teamId,
      userId,
      jobId: job.id,
    });

    const errorType = classifyError(err);

    campaignLogger.error("Campaign worker failed", err, {
      errorType,
    });

    // Log error to database
    await logCampaignError(
      teamId,
      marketingCampaignId,
      err,
      errorType
    );

    await updateMarketingCampaignStatus(
      marketingCampaignId,
      MarketingCampaignStatusEnum.Failed,
      teamId
    );

    const socketId = socketRegistry.getSocketId(userId);

    if (socketId) {
      ioInstance
        .to(`team:${teamId}`)
        .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
          error: err,
          jobId: job.id,
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
  try {
    await withTenantTransaction(teamId, async (tx) => {
      await tx
        .update(marketingCampaignsTable)
        .set({ status: status })
        .where(eq(marketingCampaignsTable.id, id));
    });
  } catch (error) {
    console.error("Failed to update campaign status:", error);
  }
}
