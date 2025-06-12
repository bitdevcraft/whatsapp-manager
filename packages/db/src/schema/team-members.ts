import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { teamsTable } from "./teams";
import { relations } from "drizzle-orm";

export const teamMembersTable = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
  role: varchar("role", { length: 50 }).notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export type TeamMember = typeof teamMembersTable.$inferSelect;
export type NewTeamMember = typeof teamMembersTable.$inferInsert;

export const teamMembersRelations = relations(teamMembersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [teamMembersTable.userId],
    references: [usersTable.id],
  }),
  team: one(teamsTable, {
    fields: [teamMembersTable.teamId],
    references: [teamsTable.id],
  }),
}));
