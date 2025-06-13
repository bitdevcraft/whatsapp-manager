import { Entity } from "../enums/entity-enum";
import { enumToValues } from "../enums/enum-helper";
import { baseSchema } from "../helpers/column-helper";
import { pgEnum, pgPolicy, pgTable, uuid } from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { relations, sql } from "drizzle-orm";

export const entityEnum = pgEnum("entity", enumToValues(Entity));

export const listViewsTable = pgTable(
  "list_views",
  {
    ...baseSchema,
    entity: entityEnum("entity"),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
  },
  (t) => [
    // only allow SELECTs where team_id matches the session var
    pgPolicy("list_views_select_tenant", {
      for: "select",
      to: process.env.POSTGRES_USER_ROLE!, // <-- your DB role here
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // inserts must set team_id = current_tenant
    pgPolicy("list_views_insert_tenant", {
      for: "insert",
      to: process.env.POSTGRES_USER_ROLE!,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // updates only on your rows, and team_id can't be changed
    pgPolicy("list_views_update_tenant", {
      for: "update",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // deletes only your rows
    pgPolicy("list_views_delete_tenant", {
      for: "delete",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
  ]
);

export const listViewsRelations = relations(listViewsTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [listViewsTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type ListView = typeof listViewsTable.$inferSelect;
export type NewListView = typeof listViewsTable.$inferInsert;
