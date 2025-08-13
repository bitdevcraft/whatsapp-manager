import { relations } from "drizzle-orm";
import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

import { Entity } from "../enums/entity-enum";
import { enumToValues } from "../enums/enum-helper";
import { createOrganizationPolicies } from "../policies/workspace";
import { baseModel } from "./abstract/baseModel";
import { teamsTable } from "./teams";

export const entityEnum = pgEnum("entity", enumToValues(Entity));

export const listViewsTable = pgTable(
  "list_views",
  {
    ...baseModel,
    entity: entityEnum("entity"),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
  },
  (t) => [...createOrganizationPolicies("list_views", t)]
);

export const listViewsRelations = relations(listViewsTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [listViewsTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type ListView = typeof listViewsTable.$inferSelect;
export type NewListView = typeof listViewsTable.$inferInsert;
