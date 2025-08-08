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
import { Worker } from "bullmq";
import { and, eq } from "drizzle-orm";

import { waClientRegistry } from "@/instance";
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

export function setupBulkMessagesWorker() {
  const worker = new Worker<BulkMessageQueue>(
    WhatsAppEvents.ProcessingBulkMessagesOutgoing,
    async (job) => {
      try {
        const { marketingCampaignId, registryId, teamId, template, userId } =
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
          const { type, parameters } = component;

          if (type === ComponentTypesEnum.Header) {
            const baseConversation: baseConversation = {};
            const parameterName: Record<string, string> = {};
            const indexName: string[] = [];
            parameters.forEach((parameter) => {
              switch (parameter.type) {
                case ParametersTypesEnum.Document:
                case ParametersTypesEnum.Image:
                case ParametersTypesEnum.Video:
                  baseConversation.media = {
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
              conversationBody.header.media = baseConversation.media;

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
      });
  });

  return worker;
}
