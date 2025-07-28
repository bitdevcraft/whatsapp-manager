import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { relations } from "drizzle-orm";
import { baseIdModel } from "./abstract/baseIdModel";
import { teamsTable } from "./teams";

export const invitationsTable = pgTable("invitations", {
  ...baseIdModel,
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => usersTable.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
});

export type Invitation = typeof invitationsTable.$inferSelect;
export type NewInvitation = typeof invitationsTable.$inferInsert;

export const invitationsRelations = relations(invitationsTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [invitationsTable.teamId],
    references: [teamsTable.id],
  }),
  invitedBy: one(usersTable, {
    fields: [invitationsTable.invitedBy],
    references: [usersTable.id],
  }),
}));
