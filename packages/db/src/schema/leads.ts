import { boolean, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { baseSchema } from "../helpers/column.helper";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";

export const leadsTable = pgTable("leads", {
  ...baseSchema,
  phone: varchar("phone", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  interests: jsonb("interests").$type<string[]>().default([]),
  message: varchar("message", { length: 2048 }).notNull(),
  optIn: boolean("opt_in").default(true),
  assignedTo: uuid().references(() => usersTable.id),
});

// Relations
export const leadsRelations = relations(leadsTable, ({ one }) => ({
  assigned_to: one(usersTable, {
    fields: [leadsTable.assignedTo],
    references: [usersTable.id],
  }),
}));

export type Lead = typeof leadsTable.$inferSelect;
export type NewLead = typeof leadsTable.$inferInsert;
