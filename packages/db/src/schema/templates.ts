import { TemplateResponse } from "@workspace/wa-cloud-api";
import { relations } from "drizzle-orm";
import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

import { createOrganizationPolicies } from "../policies/workspace";
import { teamsTable } from "./teams";

export const templatesTable = pgTable(
  "templates",
  {
    content: jsonb("content").$type<TemplateResponse>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    id: varchar("id", {
      length: 255,
    }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    updatedAt: timestamp("updated_at"),
  },
  (t) => [...createOrganizationPolicies("templates", t)]
);

export const templatesRelations = relations(templatesTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [templatesTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type NewTemplate = typeof templatesTable.$inferInsert;
export type Template = typeof templatesTable.$inferSelect;

export const TemplateSchema = createInsertSchema(templatesTable);
