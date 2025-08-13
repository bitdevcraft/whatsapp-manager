import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "./abstract/baseIdModel";
import { teamsTable } from "./teams";
import { usersTable } from "./users";

export const invitationsTable = pgTable("invitations", {
  ...baseIdModel,
  email: varchar("email", { length: 255 }).notNull(),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => usersTable.id),
  role: varchar("role", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
});

export type Invitation = typeof invitationsTable.$inferSelect;
export type NewInvitation = typeof invitationsTable.$inferInsert;

export const invitationsRelations = relations(invitationsTable, ({ one }) => ({
  invitedBy: one(usersTable, {
    fields: [invitationsTable.invitedBy],
    references: [usersTable.id],
  }),
  team: one(teamsTable, {
    fields: [invitationsTable.teamId],
    references: [teamsTable.id],
  }),
}));
