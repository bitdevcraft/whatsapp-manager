import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { ioInstance } from "@/socket";
import { socketRegistry } from "@/socket";
import {
  NotificationEvent,
  NotificationRelatedObject,
  WhatsAppEvents,
} from "@workspace/shared";
import { BulkMessageQueue } from "@/types/bulk-message";
import { waClientRegistry } from "@/instance";
import {
  baseConversation,
  contactsTable,
  ConversationBody,
  conversationsTable,
  marketingCampaignsTable,
  NewContact,
  NewConversation,
  withTenantTransaction,
} from "@workspace/db";
import { and, eq, param, Param } from "drizzle-orm";

import { MessageStatus } from "@workspace/wa-cloud-api/core/webhook";
import {
  ComponentTypesEnum,
  ParametersTypesEnum,
} from "@workspace/wa-cloud-api";

export function setupBulkMessagesWorker() {
  const worker = new Worker<BulkMessageQueue>(
    WhatsAppEvents.ProcessingBulkMessagesOutgoing,
    async (job) => {
      try {
        const { template, teamId, registryId, marketingCampaignId, userId } =
          job.data;

        const whatsapp = waClientRegistry.get(registryId);

        const response = await whatsapp?.messages.template(template);

        const isSuccess = !!response?.messages[0]?.id;

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
          const { parameter_format, components } =
            templateRecord.template.content;

          components.forEach((component) => {
            switch (component.type) {
              case "HEADER":
                conversationBody.header = {
                  text: component.text,
                };
                break;
              case "BODY":
                conversationBody.body = {
                  text: component.text,
                };
                break;
              case "FOOTER":
                conversationBody.footer = component.text;
                break;
              case "BUTTONS":
                conversationBody.buttons = component.buttons.map((button) => {
                  switch (button.type) {
                    case "PHONE_NUMBER":
                    case "URL":
                    case "QUICK_REPLY":
                    case "FLOW":
                      return {
                        type: button.type,
                        text: button.text,
                      };

                    default:
                      return {
                        type: button.type,
                      };
                  }
                });
                break;

              default:
                break;
            }
          });
        }

        const { components } = template.body;

        components?.forEach((component) => {
          const { type, parameters } = component;

          if (type === ComponentTypesEnum.Header) {
            const baseConversation: baseConversation = {};
            const parameterName: Record<string, string> = {};
            const indexName: string[] = [];
            parameters.forEach((parameter) => {
              switch (parameter.type) {
                case ParametersTypesEnum.Text:
                  if (parameter.parameter_name)
                    parameterName[parameter.parameter_name] = parameter.text;
                  else indexName.push(parameter.text);
                  break;
                case ParametersTypesEnum.Image:
                case ParametersTypesEnum.Document:
                case ParametersTypesEnum.Video:
                  baseConversation.media = {
                    url: parameter.link,
                    id: parameter.id,
                    caption: parameter.caption,
                  };

                  break;
                default:
                  break;
              }
            });

            conversationBody.header!.media = baseConversation.media;

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
            parameters.forEach((parameter) => {
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

        await withTenantTransaction(teamId, async (tx) => {
          let contactId = "";

          const contact = await tx.query.contactsTable.findFirst({
            where: and(
              eq(contactsTable.normalizedPhone, response?.contacts[0]?.input!),
              eq(contactsTable.teamId, teamId)
            ),
          });

          contactId = contact?.id ?? "";

          if (!contact) {
            const insertContact: NewContact = {
              name: "",
              phone: response?.contacts[0].input!,
              teamId: teamId,
              email: "",
              message: "",
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
            teamId: teamId,
            content: template,
            wamid: response?.messages[0]?.id,
            status: isSuccess ? MessageStatus.DELIVERED : null,
            isMarketingCampaign: true,
            success: isSuccess,
            contactId: contactId,
            marketingCampaignId: marketingCampaignId,
            body: conversationBody,
            direction: "outbound",
            userId,
          };

          return await tx
            .insert(conversationsTable)
            .values(conversation)
            .returning();
        });
      } catch (error) {
        console.error(error);
        throw Error("");
      }
    },
    {
      connection: redisConnection,
      concurrency: 50,
      limiter: {
        max: 100,
        duration: 60_000,
      },
    }
  );

  worker.on("completed", (job) => {
    const { teamId, marketingCampaignId } = job.data;

    ioInstance
      .to(`team:${teamId}`)
      .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
        jobId: job.id,
        payload: {
          message: "Campaign Processed",
          data: {},
        },
        teamId,
        relatedId: marketingCampaignId,
        relatedObject: NotificationRelatedObject.MarketingCampaign,
      });
  });

  worker.on("failed", (job, err) => {
    if (!job) return;
    const { teamId, marketingCampaignId } = job.data;

    ioInstance
      .to(`team:${teamId}`)
      .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
        jobId: job.id!, // if `job.id` is possibly undefined, make sure it's not
        payload: {
          message: "Campaign Failed",
        },
        teamId,
        error: err,
        relatedId: marketingCampaignId,
        relatedObject: NotificationRelatedObject.MarketingCampaign,
      });
  });

  return worker;
}

async function insertConversation(
  conversation: NewConversation,
  teamId: string
) {
  await withTenantTransaction(teamId, async (tx) => {
    return await tx.insert(conversationsTable).values(conversation).returning();
  });
}

export function interpolate(
  template: string,
  record: Record<string, unknown> | unknown[]
): string {
  return template.replace(/{{\s*([^{}]+)\s*}}/g, (_match, rawToken) => {
    const token = String(rawToken).trim();

    if (Array.isArray(record) && /^\d+$/.test(token)) {
      // 1-based index in the placeholder → 0-based index in the array
      const value = record[Number(token) - 1];
      return value != null ? String(value) : "";
    }

    if (!Array.isArray(record) && token in record) {
      const value = (record as Record<string, unknown>)[token];
      return value != null ? String(value) : "";
    }

    // Unresolved tokens default to an empty string
    return "";
  });
}
