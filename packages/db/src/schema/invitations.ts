import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { usersTable } from "./users";
import { relations } from "drizzle-orm";

export const invitationsTable = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
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
