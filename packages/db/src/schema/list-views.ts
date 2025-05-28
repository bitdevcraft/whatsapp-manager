import { Entity } from "../enums/entity-enum";
import { enumToValues } from "../enums/enum-helper";
import { baseSchema } from "../helpers/column.helper";
import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export const entityEnum = pgEnum("entity", enumToValues(Entity));

export const listViewsTable = pgTable("list_views", {
  ...baseSchema,
  entity: entityEnum("entity"),
});

export type ListView = typeof listViewsTable.$inferSelect;
export type NewListView = typeof listViewsTable.$inferInsert;
