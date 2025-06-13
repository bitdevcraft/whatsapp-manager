import {
  boolean,
  jsonb,
  pgPolicy,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { baseSchema } from "../helpers/column-helper";
import { relations, sql } from "drizzle-orm";
import { usersTable } from "./users";
import { teamsTable } from "./teams";

export const leadsTable = pgTable(
  "leads",
  {
    ...baseSchema,
    phone: varchar("phone", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    interests: jsonb("interests").$type<string[]>().default([]),
    message: varchar("message", { length: 2048 }).notNull(),
    optIn: boolean("opt_in").default(true),
    assignedTo: uuid().references(() => usersTable.id),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
  },
  (t) => [
    // only allow SELECTs where team_id matches the session var
    pgPolicy("leads_select_tenant", {
      for: "select",
      to: process.env.POSTGRES_USER_ROLE!, // <-- your DB role here
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // inserts must set team_id = current_tenant
    pgPolicy("leads_insert_tenant", {
      for: "insert",
      to: process.env.POSTGRES_USER_ROLE!,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // updates only on your rows, and team_id can't be changed
    pgPolicy("leads_update_tenant", {
      for: "update",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // deletes only your rows
    pgPolicy("leads_delete_tenant", {
      for: "delete",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
  ]
);

// Relations
export const leadsRelations = relations(leadsTable, ({ one }) => ({
  assigned_to: one(usersTable, {
    fields: [leadsTable.assignedTo],
    references: [usersTable.id],
  }),
  team: one(teamsTable, {
    fields: [leadsTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type Lead = typeof leadsTable.$inferSelect;
export type NewLead = typeof leadsTable.$inferInsert;
