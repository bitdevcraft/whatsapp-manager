import { timestamps } from "../helpers/column.helper";
import { jsonb, pgTable, uuid } from "drizzle-orm/pg-core";

export const conversationsTable = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: jsonb("content"),
  from: uuid("from"),
  ...timestamps,
});

export type Conversation = typeof conversationsTable.$inferSelect;
export type NewConversation = typeof conversationsTable.$inferInsert;
