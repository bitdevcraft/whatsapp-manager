import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { baseModel } from "../abstract/baseModel";
import { teamsTable } from "../teams";
import { User, usersTable } from "../users";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { name, ...model } = baseModel;

export const teamMembersTable = pgTable("team_members", {
  ...model,
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  organizationId: uuid("organization_id")
    .references(() => teamsTable.id)
    .notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
});

export type NewTeamMember = typeof teamMembersTable.$inferInsert;
export type TeamMember = typeof teamMembersTable.$inferSelect;

export const teamMembersRelations = relations(teamMembersTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [teamMembersTable.organizationId],
    references: [teamsTable.id],
  }),
  user: one(usersTable, {
    fields: [teamMembersTable.userId],
    references: [usersTable.id],
  }),
}));

export type TeamMemberDetail = TeamMember & {
  user: User;
};
