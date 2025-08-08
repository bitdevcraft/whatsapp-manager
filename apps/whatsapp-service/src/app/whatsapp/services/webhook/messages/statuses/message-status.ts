import { conversationsTable, db } from "@workspace/db";
import {
  NotificationEvent,
  NotificationRelatedObject,
} from "@workspace/shared";
import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";

import { ioInstance } from "@/socket";

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
      relatedId: conv.id,
      relatedObject: NotificationRelatedObject.Conversation,
      teamId: conv.teamId,
    });

  if (conv.marketingCampaignId)
    ioInstance
      .to(`team:${conv.teamId}`)
      .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
        payload: {
          message: "Conversation Status Update",
        },
        relatedId: conv.marketingCampaignId,
        relatedObject: NotificationRelatedObject.MarketingCampaign,
        teamId: conv.teamId,
      });
}
