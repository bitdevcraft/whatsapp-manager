import { timestamps } from "../helpers/column-helper";
import {
  boolean,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { contactsTable } from "./contacts";
import { relations, sql } from "drizzle-orm";
import { enumToValues } from "../enums/enum-helper";
import { teamsTable } from "./teams";
import { MessageStatus } from "@workspace/wa-cloud-api/core/webhook";

export const conversationStatusEnum = pgEnum(
  "status",
  enumToValues(MessageStatus)
);

export const conversationsTable = pgTable(
  "conversations",
  {
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
  },
  (t) => [
    // only allow SELECTs where team_id matches the session var
    pgPolicy("conversations_select_tenant", {
      for: "select",
      to: process.env.POSTGRES_USER_ROLE!, // <-- your DB role here
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // inserts must set team_id = current_tenant
    pgPolicy("conversations_insert_tenant", {
      for: "insert",
      to: process.env.POSTGRES_USER_ROLE!,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // updates only on your rows, and team_id can't be changed
    pgPolicy("conversations_update_tenant", {
      for: "update",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // deletes only your rows
    pgPolicy("conversations_delete_tenant", {
      for: "delete",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
  ]
);

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
