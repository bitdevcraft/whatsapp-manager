import { conversationsTable, conversationStatusEnum, db } from "@workspace/db";
import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";

export async function handleMessageStatus(
  client: WhatsApp,
  message: WebhookMessage
) {
  console.log(JSON.stringify(message));

  if (!message.statuses) return;
  const { id, status } = message.statuses;

  await db
    .update(conversationsTable)
    .set({
      status: status,
    })
    .where(eq(conversationsTable.wamid, id));
}
