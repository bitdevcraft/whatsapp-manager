import { timestamps } from "../helpers/column-helper";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { contactsTable } from "./contacts";
import { relations } from "drizzle-orm";
import { enumToValues } from "../enums/enum-helper";
import { MessageStatus } from "@workspace/wa-cloud-api";
import { teamsTable } from "./teams";

export const conversationStatusEnum = pgEnum(
  "status",
  enumToValues(MessageStatus)
);

export const conversationsTable = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: jsonb("content"),
  from: uuid("from"),
  contactId: uuid("contact_id").references(() => contactsTable.id),
  isMarketingCampaign: boolean("is_marketing_campaign"),
  waResponse: jsonb("wa_response"),
  wamid: varchar("wamid", { length: 65_535 }),
  status: conversationStatusEnum(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
  ...timestamps,
});

export const conversationsRelations = relations(
  conversationsTable,
  ({ one }) => ({
    contact: one(contactsTable, {
      fields: [conversationsTable.contactId],
      references: [contactsTable.id],
    }),
    team: one(teamsTable, {
      fields: [conversationsTable.teamId],
      references: [teamsTable.id],
    }),
  })
);

export type Conversation = typeof conversationsTable.$inferSelect;
export type NewConversation = typeof conversationsTable.$inferInsert;
