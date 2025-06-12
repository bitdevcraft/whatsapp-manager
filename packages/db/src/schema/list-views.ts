import { Entity } from "../enums/entity-enum";
import { enumToValues } from "../enums/enum-helper";
import { baseSchema } from "../helpers/column-helper";
import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { relations } from "drizzle-orm";

export const entityEnum = pgEnum("entity", enumToValues(Entity));

export const listViewsTable = pgTable("list_views", {
  ...baseSchema,
  entity: entityEnum("entity"),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
});

export const listViewsRelations = relations(listViewsTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [listViewsTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type ListView = typeof listViewsTable.$inferSelect;
export type NewListView = typeof listViewsTable.$inferInsert;
