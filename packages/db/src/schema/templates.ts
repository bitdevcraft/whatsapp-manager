import { baseSchema } from "../helpers/column.helper";
import { jsonb, pgTable } from "drizzle-orm/pg-core";

export const templatesTable = pgTable("templates", {
  ...baseSchema,
  content: jsonb("content"),
});

export type Template = typeof templatesTable.$inferSelect;
export type NewTemplate = typeof templatesTable.$inferInsert;
