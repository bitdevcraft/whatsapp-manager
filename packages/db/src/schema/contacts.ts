import { boolean, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { baseSchema } from "../helpers/column.helper";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";

export const contactsTable = pgTable("contacts", {
  ...baseSchema,
  phone: varchar("phone", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  interests: jsonb("interests").$type<string[]>().default([]),
  message: varchar("message", { length: 2048 }).notNull(),
  optIn: boolean("opt_in").default(true),
  assignedTo: uuid().references(() => usersTable.id),
});

// Relations
export const contactsRelations = relations(contactsTable, ({ one }) => ({
  assigned_to: one(usersTable, {
    fields: [contactsTable.assignedTo],
    references: [usersTable.id],
  }),
}));

export type Contact = typeof contactsTable.$inferSelect;
export type NewContact = typeof contactsTable.$inferInsert;
