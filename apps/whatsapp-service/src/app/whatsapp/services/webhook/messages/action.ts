import { ioInstance } from "@/socket";
import {
  contactsTable,
  ConversationBody,
  conversationsTable,
  db,
  NewContact,
  NewConversation,
  whatsAppBusinessAccountsTable,
  withTenantTransaction,
} from "@workspace/db";
import {
  NotificationEvent,
  NotificationRelatedObject,
} from "@workspace/shared";
import { WebhookMessage } from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";

export async function insertConversation(
  body: ConversationBody,
  message: WebhookMessage
) {
  const account = await db.query.whatsAppBusinessAccountsTable.findFirst({
    where: eq(whatsAppBusinessAccountsTable.id, Number(message.wabaId)),
  });

  if (!account) {
    return;
  }

  const conversation: NewConversation = {
    teamId: account.teamId,
    content: message,
    wamid: message.id,
    success: true,
    repliedTo: message.originalData?.context?.id,
    direction: "inbound",
    body,
  };

  const data = await withTenantTransaction(account.teamId, async (tx) => {
    let contact = await tx.query.contactsTable.findFirst({
      where: eq(contactsTable.normalizedPhone, message.from),
    });

    if (!contact) {
      const temp: NewContact = {
        teamId: account.teamId,
        phone: message.from,
        email: "",
        message: "",
        name: message.profileName ?? "",
      };
      contact = (await tx.insert(contactsTable).values(temp).returning())[0];
    }

    conversation.contactId = contact?.id;

    return await tx.insert(conversationsTable).values(conversation).returning();
  });

  if (data[0])
    ioInstance
      .to(`team:${account.teamId}`)
      .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
        payload: {
          message: "Campaign Failed",
        },
        teamId: account.teamId,
        relatedId: data[0].id,
        relatedObject: NotificationRelatedObject.Conversation,
      });
}
