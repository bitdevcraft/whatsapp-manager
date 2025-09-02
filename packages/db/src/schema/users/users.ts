import { relations } from "drizzle-orm";
import { boolean, pgTable, text, varchar } from "drizzle-orm/pg-core";

import { baseModel } from "../abstract/baseModel";
import { invitationsTable } from "../invitations";
import { teamMembersTable } from "../teams";

export const usersTable = pgTable("users", {
  ...baseModel,
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified"),
  image: text("image"),
  name: varchar("name", { length: 255 }),
  passwordHash: text("password_hash"),
  role: varchar("role", { length: 255 }).notNull().default("user"),
});

export type NewUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;

export const usersRelations = relations(usersTable, ({ many }) => ({
  invitationsSent: many(invitationsTable),
  teamMembers: many(teamMembersTable),
}));
