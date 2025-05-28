import { pgTable, varchar } from "drizzle-orm/pg-core";
import { baseSchema } from "../helpers/column.helper";

export const usersTable = pgTable("users", {
  ...baseSchema,
  role: varchar("role", { length: 255 }).notNull().default("user"),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
