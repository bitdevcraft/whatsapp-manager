import { timestamps } from "../helpers/column.helper";
import { jsonb, pgTable, uuid } from "drizzle-orm/pg-core";
import { contactsTable } from "./contacts";
import { relations } from "drizzle-orm";

export const conversationsTable = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: jsonb("content"),
  from: uuid("from"),
  contactId: uuid("contact_id").references(() => contactsTable.id),
  ...timestamps,
});

export const conversationsRelations = relations(
  conversationsTable,
  ({ one }) => ({
    contact: one(contactsTable, {
      fields: [conversationsTable.contactId],
      references: [contactsTable.id],
    }),
  })
);

export type Conversation = typeof conversationsTable.$inferSelect;
export type NewConversation = typeof conversationsTable.$inferInsert;
