import { db } from "@workspace/db";
import { conversationsTable } from "@workspace/db/schema/conversations";

export async function getConversations() {
  return await db.select().from(conversationsTable);
}
