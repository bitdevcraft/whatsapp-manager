import {
  campaignMessageStatusTable,
  campaignErrorLogsTable,
  CampaignMessageStatus,
  marketingCampaignsTable,
  withTenantTransaction,
} from "@workspace/db";
import { eq } from "drizzle-orm";

import { waEventQueue } from "@/jobs/queue";
import { createCampaignLogger } from "@/lib/logger";
import { WhatsAppEvents } from "@workspace/shared";
import type { BulkMessageQueue } from "@/types/bulk-message";

export interface RetryResult {
  success: boolean;
  retriedCount: number;
  errors: string[];
}

export interface FailedMessageDetails {
  id: string;
  recipientPhone: string;
  errorCode: string | null;
  errorMessage: string | null;
  canRetry: boolean;
  createdAt: Date;
}

/**
 * Get all failed messages for a campaign that can be retried
 */
export async function getFailedCampaignMessages(
  teamId: string,
  marketingCampaignId: string
): Promise<FailedMessageDetails[]> {
  const messages = await withTenantTransaction(teamId, async (tx) => {
    return await tx.query.campaignMessageStatusTable.findMany({
      where: (table, { eq, and }) =>
        and(
          eq(table.marketingCampaignId, marketingCampaignId),
          eq(table.status, CampaignMessageStatus.FAILED),
          eq(table.canRetry, true)
        ),
      orderBy: (table, { asc }) => [asc(table.createdAt)],
    });
  });

  return messages.map((msg) => ({
    id: msg.id,
    recipientPhone: msg.recipientPhone,
    errorCode: msg.errorCode,
    errorMessage: msg.errorMessage,
    canRetry: msg.canRetry,
    createdAt: msg.createdAt,
  }));
}

/**
 * Get error summary for a campaign
 */
export async function getCampaignErrorSummary(
  teamId: string,
  marketingCampaignId: string
): Promise<Record<string, number>> {
  const errors = await withTenantTransaction(teamId, async (tx) => {
    return await tx.query.campaignErrorLogsTable.findMany({
      where: (table, { eq }) =>
        eq(table.marketingCampaignId, marketingCampaignId),
    });
  });

  const summary: Record<string, number> = {};
  for (const error of errors) {
    const errorType = error.errorType || "UNKNOWN_ERROR";
    summary[errorType] = (summary[errorType] || 0) + 1;
  }

  return summary;
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(
  teamId: string,
  marketingCampaignId: string
) {
  const campaign = await withTenantTransaction(teamId, async (tx) => {
    return await tx.query.marketingCampaignsTable.findFirst({
      where: eq(marketingCampaignsTable.id, marketingCampaignId),
    });
  });

  const messageStats = await withTenantTransaction(teamId, async (tx) => {
    const messages = await tx.query.campaignMessageStatusTable.findMany({
      where: (table, { eq }) =>
        eq(table.marketingCampaignId, marketingCampaignId),
    });

    const stats = {
      pending: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    };

    for (const msg of messages) {
      const status = msg.status as CampaignMessageStatus;
      if (status in stats) {
        stats[status as keyof typeof stats]++;
      }
    }

    return stats;
  });

  return {
    campaign: {
      id: campaign?.id,
      name: campaign?.name,
      status: campaign?.status,
      totalRecipients: campaign?.totalRecipients,
      sentCount: campaign?.sentCount,
      deliveredCount: campaign?.deliveredCount,
      failedCount: campaign?.failedCount,
      errorSummary: campaign?.errorSummary,
    },
    messageStats,
  };
}

/**
 * Retry specific failed messages by their IDs
 */
export async function retryFailedMessages(
  teamId: string,
  marketingCampaignId: string,
  messageIds: string[]
): Promise<RetryResult> {
  const campaignLogger = createCampaignLogger({
    marketingCampaignId,
    teamId,
  });

  campaignLogger.info("Retrying failed messages", {
    messageCount: messageIds.length,
  });

  const errors: string[] = [];
  let retriedCount = 0;

  // Get the campaign details to reconstruct the jobs
  const campaign = await withTenantTransaction(teamId, async (tx) => {
    return await tx.query.marketingCampaignsTable.findFirst({
      where: eq(marketingCampaignsTable.id, marketingCampaignId),
      with: {
        team: {
          with: {
            waBusinessAccount: true,
          },
        },
      },
    });
  });

  if (!campaign) {
    campaignLogger.error("Campaign not found for retry");
    return { success: false, retriedCount: 0, errors: ["Campaign not found"] };
  }

  for (const messageId of messageIds) {
    try {
      const messageStatus = await withTenantTransaction(teamId, async (tx) => {
        return await tx.query.campaignMessageStatusTable.findFirst({
          where: eq(campaignMessageStatusTable.id, messageId),
        });
      });

      if (!messageStatus) {
        errors.push(`Message ${messageId} not found`);
        continue;
      }

      if (!messageStatus.canRetry) {
        errors.push(`Message for ${messageStatus.recipientPhone} cannot be retried`);
        continue;
      }

      // Get the original job data from error logs
      const errorLog = await withTenantTransaction(teamId, async (tx) => {
        return await tx.query.campaignErrorLogsTable.findFirst({
          where: (table, { eq, and }) =>
            and(
              eq(table.marketingCampaignId, marketingCampaignId),
              eq(table.recipientPhone, messageStatus.recipientPhone)
            ),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        });
      });

      if (errorLog?.jobData && typeof errorLog.jobData === "object") {
        const jobData = errorLog.jobData as BulkMessageQueue;

        // Update retry count
        await withTenantTransaction(teamId, async (tx) => {
          await tx
            .update(campaignMessageStatusTable)
            .set({
              retryCount: (messageStatus.retryCount || 0) + 1,
              status: CampaignMessageStatus.PENDING,
            })
            .where(eq(campaignMessageStatusTable.id, messageId));
        });

        // Re-queue the message
        await waEventQueue.add(
          `${WhatsAppEvents.ProcessingBulkMessagesOutgoing}:${teamId}`,
          {
            ...jobData,
            retryCount: (messageStatus.retryCount || 0) + 1,
          }
        );

        retriedCount++;
      } else {
        errors.push(`No job data found for message ${messageId}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to retry message ${messageId}: ${errorMsg}`);
    }
  }

  campaignLogger.info("Retry completed", {
    retriedCount,
    errorCount: errors.length,
  });

  return {
    success: errors.length === 0,
    retriedCount,
    errors,
  };
}

/**
 * Retry all failed messages for a campaign
 */
export async function retryAllFailedMessages(
  teamId: string,
  marketingCampaignId: string
): Promise<RetryResult> {
  const failedMessages = await getFailedCampaignMessages(
    teamId,
    marketingCampaignId
  );

  if (failedMessages.length === 0) {
    return {
      success: true,
      retriedCount: 0,
      errors: [],
    };
  }

  const messageIds = failedMessages.map((msg) => msg.id);
  return retryFailedMessages(teamId, marketingCampaignId, messageIds);
}
