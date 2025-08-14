import { relations, SQL, sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { baseSchema } from "../helpers/column-helper";
import { createOrganizationPolicies } from "../policies/workspace";
import { Conversation, conversationsTable } from "./conversations";
import { teamsTable } from "./teams";
import { usersTable } from "./users";

export const contactsTable = pgTable(
  "contacts",
  {
    ...baseSchema,
    assignedTo: uuid("assigned_to").references(() => usersTable.id),
    email: varchar("email", { length: 255 }).notNull(),
    interests: jsonb("interests").$type<string[]>().default([]),
    lastMessageDate: timestamp("last_message_date"),
    message: varchar("message", { length: 2048 }).notNull(),
    normalizedPhone: varchar("normalized_phone", {
      length: 255,
    }).generatedAlwaysAs(
      (): SQL => sql`regexp_replace(${contactsTable.phone}, '\\D', '', 'g')`
    ),
    optIn: boolean("opt_in").default(true),
    phone: varchar("phone", { length: 255 }).notNull(),
    tags: jsonb("tags").$type<string[]>().default([]),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
  },
  (t) => [
    ...createOrganizationPolicies("contacts", t),
    uniqueIndex("contacts_team_phone_unique").on(t.teamId, t.phone),
  ]
);

// Relations
export const contactsRelations = relations(contactsTable, ({ many, one }) => ({
  assigned_to: one(usersTable, {
    fields: [contactsTable.assignedTo],
    references: [usersTable.id],
  }),
  conversations: many(conversationsTable),
  team: one(teamsTable, {
    fields: [contactsTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type Contact = typeof contactsTable.$inferSelect;
export type ContactConversation = Contact & {
  conversations: Conversation[];
};

export type NewContact = typeof contactsTable.$inferInsert;
