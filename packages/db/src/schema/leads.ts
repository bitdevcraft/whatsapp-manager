import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { createOrganizationPolicies } from "../policies/workspace";
import { baseModel } from "./abstract/baseModel";
import { teamsTable } from "./teams";
import { usersTable } from "./users";

export const leadsTable = pgTable(
  "leads",
  {
    ...baseModel,
    assignedTo: uuid().references(() => usersTable.id),
    email: varchar("email", { length: 255 }).notNull(),
    interests: jsonb("interests").$type<string[]>().default([]),
    message: varchar("message", { length: 2048 }).notNull(),
    optIn: boolean("opt_in").default(true),
    phone: varchar("phone", { length: 255 }).notNull(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
  },
  (t) => [...createOrganizationPolicies("leads", t)]
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
