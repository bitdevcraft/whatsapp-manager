import {
  boolean,
  jsonb,
  pgPolicy,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { baseSchema } from "../helpers/column-helper";
import { relations, SQL, sql } from "drizzle-orm";
import { usersTable } from "./users";
import { Conversation, conversationsTable } from "./conversations";
import { teamsTable } from "./teams";

export const contactsTable = pgTable(
  "contacts",
  {
    ...baseSchema,
    phone: varchar("phone", { length: 255 }).notNull(),
    normalizedPhone: varchar("normalized_phone", {
      length: 255,
    }).generatedAlwaysAs(
      (): SQL => sql`regexp_replace(${contactsTable.phone}, '\\D', '', 'g')`
    ),
    email: varchar("email", { length: 255 }).notNull(),
    interests: jsonb("interests").$type<string[]>().default([]),
    message: varchar("message", { length: 2048 }).notNull(),
    optIn: boolean("opt_in").default(true),
    assignedTo: uuid("assigned_to").references(() => usersTable.id),
    tags: jsonb("tags").$type<string[]>().default([]),
    lastMessageDate: timestamp("last_message_date"),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
  },
  (t) => [
    // only allow SELECTs where team_id matches the session var
    pgPolicy("contacts_select_tenant", {
      for: "select",
      to: process.env.POSTGRES_USER_ROLE!, // <-- your DB role here
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // inserts must set team_id = current_tenant
    pgPolicy("contacts_insert_tenant", {
      for: "insert",
      to: process.env.POSTGRES_USER_ROLE!,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // updates only on your rows, and team_id can't be changed
    pgPolicy("contacts_update_tenant", {
      for: "update",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // deletes only your rows
    pgPolicy("contacts_delete_tenant", {
      for: "delete",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    uniqueIndex("contacts_team_phone_unique").on(t.teamId, t.phone),
  ]
);

// Relations
export const contactsRelations = relations(contactsTable, ({ one, many }) => ({
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
export type NewContact = typeof contactsTable.$inferInsert;

export type ContactConversation = Contact & {
  conversations: Conversation[];
};
