import { boolean, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { invitationsTable } from "../invitations";
import { baseModel } from "../abstract/baseModel";
import { teamMembersTable } from "../teams";

export const usersTable = pgTable("users", {
  ...baseModel,
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 255 }).notNull().default("user"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified"),
  image: text("image"),
  passwordHash: text("password_hash"),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export const usersRelations = relations(usersTable, ({ many }) => ({
  teamMembers: many(teamMembersTable),
  invitationsSent: many(invitationsTable),
}));
