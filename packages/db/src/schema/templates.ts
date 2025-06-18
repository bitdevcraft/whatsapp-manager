import {
  jsonb,
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { relations, sql } from "drizzle-orm";
import { TemplateResponse } from "@workspace/wa-cloud-api";

export const templatesTable = pgTable(
  "templates",
  {
    id: varchar("id", {
      length: 255,
    }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    content: jsonb("content").$type<TemplateResponse>(),
    updatedAt: timestamp("updated_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
  },
  (t) => [
    // only allow SELECTs where team_id matches the session var
    pgPolicy("templates_select_tenant", {
      for: "select",
      to: process.env.POSTGRES_USER_ROLE!, // <-- your DB role here
      using: sql`${t.teamId}
            = current_setting('app.current_tenant')::uuid`,
    }),
    // inserts must set team_id = current_tenant
    pgPolicy("templates_insert_tenant", {
      for: "insert",
      to: process.env.POSTGRES_USER_ROLE!,
      withCheck: sql`${t.teamId}
            = current_setting('app.current_tenant')::uuid`,
    }),
    // updates only on your rows, and team_id can't be changed
    pgPolicy("templates_update_tenant", {
      for: "update",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId}
            = current_setting('app.current_tenant')::uuid`,
      withCheck: sql`${t.teamId}
            = current_setting('app.current_tenant')::uuid`,
    }),
    // deletes only your rows
    pgPolicy("templates_delete_tenant", {
      for: "delete",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId}
            = current_setting('app.current_tenant')::uuid`,
    }),
  ],
);

export const templatesRelations = relations(templatesTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [templatesTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type Template = typeof templatesTable.$inferSelect;
export type NewTemplate = typeof templatesTable.$inferInsert;
