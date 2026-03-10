import {
  baseConversation,
  campaignErrorLogsTable,
  campaignMessageStatusTable,
  CampaignErrorType,
  CampaignMessageStatus,
  contactsTable,
  ConversationBody,
  conversationsTable,
  marketingCampaignsTable,
  NewContact,
  NewConversation,
  teamMembersUsageTracking,
  withTenantTransaction,
} from "@workspace/db";
import { UsageLimitRepository } from "@workspace/db/repositories";
import {
  NotificationEvent,
  NotificationRelatedObject,
  WhatsAppEvents,
} from "@workspace/shared";
import {
  ComponentTypesEnum,
  ParametersTypesEnum,
} from "@workspace/wa-cloud-api";
import { MessageStatus } from "@workspace/wa-cloud-api/core/webhook";
import { Worker, Job } from "bullmq";
import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import { waClientRegistry } from "@/instance";
import { createCampaignLogger } from "@/lib/logger";
import { redisConnection } from "@/lib/redis";
import { ioInstance } from "@/socket";
import { BulkMessageQueue } from "@/types/bulk-message";

export function interpolate(
  template: string,
  record: Record<string, unknown> | unknown[]
): string {
  return template.replace(/{{\s*([^{}]+)\s*}}/g, (_match, rawToken) => {
    const token = String(rawToken).trim();

    if (Array.isArray(record) && /^\d+$/.test(token)) {
      // 1-based index in the placeholder → 0-based index in the array
      const value = record[Number(token) - 1];
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value != null ? String(value) : "";
    }

    if (!Array.isArray(record) && token in record) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const value = (record as Record<string, unknown>)[token];
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      return value != null ? String(value) : "";
    }

    // Unresolved tokens default to an empty string
    return "";
  });
}

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
  recipientPhone: string,
  error: Error | unknown,
  jobData: BulkMessageQueue,
  errorType: CampaignErrorType
) {
  try {
    await withTenantTransaction(teamId, async (tx) => {
      await tx.insert(campaignErrorLogsTable).values({
        marketingCampaignId,
        teamId,
        recipientPhone,
        errorType,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : null,
        jobData: jobData as any,
      });
    });
  } catch (logError) {
    // If we can't log to database, at least log to console
    console.error("Failed to log campaign error:", logError);
  }
}

async function updateMessageStatus(
  teamId: string,
  marketingCampaignId: string,
  recipientPhone: string,
  status: CampaignMessageStatus,
  wamid?: string,
  errorCode?: string,
  errorMessage?: string,
  canRetry = true
) {
  try {
    await withTenantTransaction(teamId, async (tx) => {
      // Check if status record exists
      const existing = await tx.query.campaignMessageStatusTable.findFirst({
        where: (table, { eq, and }) =>
          and(
            eq(table.marketingCampaignId, marketingCampaignId),
            eq(table.recipientPhone, recipientPhone)
          ),
      });

      if (existing) {
        // Update existing record
        await tx
          .update(campaignMessageStatusTable)
          .set({
            status,
            wamid: wamid ?? existing.wamid,
            errorCode,
            errorMessage,
            canRetry,
            sentAt: status === CampaignMessageStatus.SENT ? new Date() : existing.sentAt,
            deliveredAt: status === CampaignMessageStatus.DELIVERED ? new Date() : existing.deliveredAt,
          })
          .where(eq(campaignMessageStatusTable.id, existing.id));
      } else {
        // Insert new record
        await tx.insert(campaignMessageStatusTable).values({
          marketingCampaignId,
          teamId,
          recipientPhone,
          status,
          wamid,
          errorCode,
          errorMessage,
          canRetry,
          sentAt: status === CampaignMessageStatus.SENT ? new Date() : undefined,
          deliveredAt: status === CampaignMessageStatus.DELIVERED ? new Date() : undefined,
        });
      }
    });
  } catch (error) {
    console.error("Failed to update message status:", error);
  }
}

async function incrementCampaignCounters(
  teamId: string,
  marketingCampaignId: string,
  sentDelta = 0,
  deliveredDelta = 0,
  failedDelta = 0,
  errorType?: string
) {
  try {
    await withTenantTransaction(teamId, async (tx) => {
      const campaign = await tx.query.marketingCampaignsTable.findFirst({
        where: eq(marketingCampaignsTable.id, marketingCampaignId),
      });

      if (!campaign) return;

      // Update counters
      await tx
        .update(marketingCampaignsTable)
        .set({
          sentCount: (campaign.sentCount || 0) + sentDelta,
          deliveredCount: (campaign.deliveredCount || 0) + deliveredDelta,
          failedCount: (campaign.failedCount || 0) + failedDelta,
        })
        .where(eq(marketingCampaignsTable.id, marketingCampaignId));

      // Update error summary if provided
      if (errorType && failedDelta > 0) {
        const currentSummary = (campaign.errorSummary as Record<string, number>) || {};
        const newSummary = {
          ...currentSummary,
          [errorType]: (currentSummary[errorType] || 0) + failedDelta,
        };

        await tx
          .update(marketingCampaignsTable)
          .set({ errorSummary: newSummary })
          .where(eq(marketingCampaignsTable.id, marketingCampaignId));
      }
    });
  } catch (error) {
    console.error("Failed to increment campaign counters:", error);
  }
}

export function setupBulkMessagesWorker() {
  const worker = new Worker<BulkMessageQueue>(
    WhatsAppEvents.ProcessingBulkMessagesOutgoing,
    async (job: Job<BulkMessageQueue>) => {
      const { marketingCampaignId, registryId, teamId, template, userId } =
        job.data;

      const campaignLogger = createCampaignLogger({
        marketingCampaignId,
        teamId,
        userId,
        jobId: job.id,
      });

      const recipientPhone = template.to;

      campaignLogger.info("Processing message", { recipientPhone });

      // Initialize message status as PENDING
      await updateMessageStatus(
        teamId,
        marketingCampaignId,
        recipientPhone,
        CampaignMessageStatus.PENDING
      );

      try {
        const whatsapp = waClientRegistry.get(registryId);

        if (!whatsapp) {
          throw new Error("WhatsApp client not found in registry");
        }

        const response = await whatsapp.messages.template(template);

        const isSuccess = !!response?.messages[0]?.id;
        const wamid = response?.messages[0]?.id;

        if (!isSuccess) {
          throw new Error("WhatsApp API returned unsuccessful response");
        }

        campaignLogger.info("Message sent successfully", {
          recipientPhone,
          wamid,
        });

        // Update message status to SENT
        await updateMessageStatus(
          teamId,
          marketingCampaignId,
          recipientPhone,
          CampaignMessageStatus.SENT,
          wamid
        );

        // Increment sent counter
        await incrementCampaignCounters(teamId, marketingCampaignId, 1, 0, 0);

        const conversationBody: ConversationBody = {};

        const templateRecord = await withTenantTransaction(
          teamId,
          async (tx) => {
            return await tx.query.marketingCampaignsTable.findFirst({
              where: eq(marketingCampaignsTable.id, marketingCampaignId),
              with: {
                template: true,
              },
            });
          }
        );

        if (templateRecord?.template.content) {
          const { components } = templateRecord.template.content;

          components.forEach((component) => {
            switch (component.type) {
              case "BODY":
                conversationBody.body = {
                  text: component.text,
                };
                break;
              case "BUTTONS":
                conversationBody.buttons = component.buttons.map((button) => {
                  switch (button.type) {
                    case "FLOW":
                    case "PHONE_NUMBER":
                    case "QUICK_REPLY":
                    case "URL":
                      return {
                        text: button.text,
                        type: button.type,
                      };

                    default:
                      return {
                        type: button.type,
                      };
                  }
                });
                break;
              case "FOOTER":
                conversationBody.footer = component.text;
                break;
              case "HEADER":
                conversationBody.header = {
                  text: component.text,
                };
                break;

              default:
                break;
            }
          });
        }

        const { components } = template.body;

        components?.forEach((component) => {
          const { type } = component;

          if (type === ComponentTypesEnum.Header) {
            const baseConversationHeader: baseConversation = {};
            const parameterName: Record<string, string> = {};
            const indexName: string[] = [];
            component.parameters.forEach((parameter) => {
              switch (parameter.type) {
                case ParametersTypesEnum.Document:
                case ParametersTypesEnum.Image:
                case ParametersTypesEnum.Video:
                  baseConversationHeader.media = {
                    caption: parameter.caption,
                    id: parameter.id,
                    url: parameter.link,
                  };

                  break;
                case ParametersTypesEnum.Text:
                  if (parameter.parameter_name)
                    parameterName[parameter.parameter_name] = parameter.text;
                  else indexName.push(parameter.text);
                  break;
                default:
                  break;
              }
            });

            if (conversationBody.header)
              conversationBody.header.media = baseConversationHeader.media;

            if (
              Object.keys(parameterName).length > 0 &&
              conversationBody.header?.text
            ) {
              conversationBody.header.text = interpolate(
                conversationBody.header.text,
                parameterName
              );
            }
            if (indexName.length > 0 && conversationBody.header?.text) {
              conversationBody.header.text = interpolate(
                conversationBody.header.text,
                indexName
              );
            }
          }

          if (type === ComponentTypesEnum.Body) {
            const parameterName: Record<string, string> = {};
            const indexName: string[] = [];
            component.parameters.forEach((parameter) => {
              switch (parameter.type) {
                case ParametersTypesEnum.Text:
                  if (parameter.parameter_name)
                    parameterName[parameter.parameter_name] = parameter.text;
                  else indexName.push(parameter.text);
                  break;

                  break;
                default:
                  break;
              }
            });

            if (
              Object.keys(parameterName).length > 0 &&
              conversationBody.body?.text
            ) {
              conversationBody.body.text = interpolate(
                conversationBody.body.text,
                parameterName
              );
            }
            if (indexName.length > 0 && conversationBody.body?.text) {
              conversationBody.body.text = interpolate(
                conversationBody.body.text,
                indexName
              );
            }
          }
        });

        const conv = await withTenantTransaction(teamId, async (tx) => {
          let contactId = "";

          const contact = response?.contacts[0]
            ? await tx.query.contactsTable.findFirst({
                where: and(
                  eq(contactsTable.normalizedPhone, response.contacts[0].input),
                  eq(contactsTable.teamId, teamId)
                ),
              })
            : undefined;

          contactId = contact?.id ?? "";

          if (!contact && response?.contacts[0]) {
            const insertContact: NewContact = {
              email: "",
              message: "",
              name: "",
              phone: response.contacts[0].input,
              teamId: teamId,
            };
            const temp = await tx
              .insert(contactsTable)
              .values(insertContact)
              .returning();

            if (temp[0]) {
              contactId = temp[0].id;
            }
          }

          const conversation: NewConversation = {
            body: conversationBody,
            contactId: contactId,
            content: template,
            direction: "outbound",
            isMarketingCampaign: true,
            marketingCampaignId: marketingCampaignId,
            status: isSuccess ? MessageStatus.DELIVERED : null,
            success: isSuccess,
            teamId: teamId,
            userId,
            wamid: response?.messages[0]?.id,
          };

          const conv = await tx
            .insert(conversationsTable)
            .values(conversation)
            .returning();

          return conv;
        });

        await upsertUsage(teamId, conv.length, userId);
      } catch (error) {
        const errorType = classifyError(error);

        campaignLogger.error("Message sending failed", error, {
          recipientPhone,
          errorType,
        });

        // Log error to database
        await logCampaignError(
          teamId,
          marketingCampaignId,
          recipientPhone,
          error,
          job.data,
          errorType
        );

        // Update message status to FAILED
        await updateMessageStatus(
          teamId,
          marketingCampaignId,
          recipientPhone,
          CampaignMessageStatus.FAILED,
          undefined,
          errorType,
          error instanceof Error ? error.message : String(error),
          errorType !== CampaignErrorType.INVALID_RECIPIENT // Can retry most errors except invalid recipients
        );

        // Increment failed counter
        await incrementCampaignCounters(
          teamId,
          marketingCampaignId,
          0,
          0,
          1,
          errorType
        );

        throw error; // Re-throw to mark job as failed
      }
    },
    {
      concurrency: 50,
      connection: redisConnection,
      limiter: {
        duration: 60_000,
        max: 100,
      },
    }
  );

  worker.on("completed", (job) => {
    const { marketingCampaignId, teamId } = job.data;

    const campaignLogger = createCampaignLogger({
      marketingCampaignId,
      teamId,
      jobId: job.id,
    });

    campaignLogger.info("Message job completed");

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
      });
  });

  worker.on("failed", (job, err) => {
    if (!job) return;
    const { marketingCampaignId, teamId } = job.data;

    const campaignLogger = createCampaignLogger({
      marketingCampaignId,
      teamId,
      jobId: job.id,
    });

    campaignLogger.error("Message job failed", err);

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
      });
  });

  return worker;
}

async function upsertUsage(teamId: string, usage: number, userId?: string) {
  const repo = new UsageLimitRepository(teamId);
  if (userId && usage > 0) await repo.upsertUsageTracking(userId, usage);
}
