import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { baseSchema } from "../helpers/column-helper";
import { relations } from "drizzle-orm";
import { teamMembersTable } from "./team-members";
import { invitationsTable } from "./invitations";

export const usersTable = pgTable("users", {
  ...baseSchema,
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 255 }).notNull().default("user"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export const usersRelations = relations(usersTable, ({ many }) => ({
  teamMembers: many(teamMembersTable),
  invitationsSent: many(invitationsTable),
}));
