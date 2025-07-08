import { ioInstance } from "@/socket";
import { conversationsTable, conversationStatusEnum, db } from "@workspace/db";
import {
  NotificationEvent,
  NotificationRelatedObject,
} from "@workspace/shared";
import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";

export async function handleMessageStatus(
  client: WhatsApp,
  message: WebhookMessage
) {
  if (!message.statuses) return;
  const { id, status } = message.statuses;

  const conversations = await db
    .update(conversationsTable)
    .set({
      status: status,
    })
    .where(eq(conversationsTable.wamid, id))
    .returning();

  const conv = conversations[0];

  if (!conv) return;

  ioInstance
    .to(`team:${conv.teamId}`)
    .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
      payload: {
        message: "Conversation Status Update",
      },
      teamId: conv.teamId,
      relatedId: conv.id,
      relatedObject: NotificationRelatedObject.Conversation,
    });

  if (conv.marketingCampaignId)
    ioInstance
      .to(`team:${conv.teamId}`)
      .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
        payload: {
          message: "Conversation Status Update",
        },
        teamId: conv.teamId,
        relatedId: conv.marketingCampaignId,
        relatedObject: NotificationRelatedObject.MarketingCampaign,
      });
}
