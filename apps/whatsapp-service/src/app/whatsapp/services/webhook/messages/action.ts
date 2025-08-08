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

import { ioInstance } from "@/socket";

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
    body,
    content: message,
    direction: "inbound",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    repliedTo: message.originalData?.context?.id ?? null,
    success: true,
    teamId: account.teamId,
    wamid: message.id,
  };

  const data = await withTenantTransaction(account.teamId, async (tx) => {
    let contact = await tx.query.contactsTable.findFirst({
      where: eq(contactsTable.normalizedPhone, message.from),
    });

    if (!contact) {
      const temp: NewContact = {
        email: "",
        message: "",
        name: message.profileName,
        phone: message.from,
        teamId: account.teamId,
      };
      contact = (await tx.insert(contactsTable).values(temp).returning())[0];
    }

    conversation.contactId = contact?.id;

    await tx.insert(conversationsTable).values(conversation).returning();
    return contact?.id;
  });

  if (data)
    ioInstance
      .to(`team:${account.teamId}`)
      .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
        payload: {
          message: "New Message Received",
        },
        relatedId: data,
        relatedObject: NotificationRelatedObject.Contact,
        teamId: account.teamId,
      });
}
