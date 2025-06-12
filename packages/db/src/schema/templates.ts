import { TemplateResponse } from "@workspace/wa-cloud-api/types";
import { baseSchema } from "../helpers/column-helper";
import {
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { relations } from "drizzle-orm";

export const templatesTable = pgTable("templates", {
  id: varchar("id", {
    length: 255,
  })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  content: jsonb("content").$type<TemplateResponse>(),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
});

export const templatesRelations = relations(templatesTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [templatesTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type Template = typeof templatesTable.$inferSelect;
export type NewTemplate = typeof templatesTable.$inferInsert;
