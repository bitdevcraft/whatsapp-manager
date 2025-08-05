import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { User, usersTable } from "../users";
import { teamsTable } from "../teams";
import { relations } from "drizzle-orm";
import { baseIdModel } from "../abstract/baseIdModel";
import { baseModel } from "../abstract/baseModel";

const { name, ...model } = baseModel;

export const teamMembersTable = pgTable("team_members", {
  ...model,
  organizationId: uuid("organization_id")
    .references(() => teamsTable.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
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
    fields: [teamMembersTable.organizationId],
    references: [teamsTable.id],
  }),
}));

export type TeamMemberDetail = TeamMember & {
  user: User;
};
