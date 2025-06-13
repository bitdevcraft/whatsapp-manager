import { baseSchema } from "../helpers/column-helper";
import { relations, sql, SQL } from "drizzle-orm";
import {
  pgPolicy,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";

export const tagsTable = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    updatedAt: timestamp("updated_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    name: varchar("name", { length: 255 }).notNull(),
    normalizedName: varchar("normalized_name", {
      length: 255,
    }).generatedAlwaysAs(
      (): SQL => sql`
      lower(                                      
        replace(                                  
          regexp_replace(                         
            trim(${tagsTable.name}),              
            '\\s+', ' ', 'g'
          ),
          ' ', '-'
        )
      )
    `
    ),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
  },
  (t) => [
    // only allow SELECTs where team_id matches the session var
    pgPolicy("tags_select_tenant", {
      for: "select",
      to: process.env.POSTGRES_USER_ROLE!, // <-- your DB role here
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // inserts must set team_id = current_tenant
    pgPolicy("tags_insert_tenant", {
      for: "insert",
      to: process.env.POSTGRES_USER_ROLE!,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // updates only on your rows, and team_id can't be changed
    pgPolicy("tags_update_tenant", {
      for: "update",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // deletes only your rows
    pgPolicy("tags_delete_tenant", {
      for: "delete",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    unique("tags_per_team").on(t.teamId, t.name),
  ]
);

export const tagsRelations = relations(tagsTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [tagsTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type Tag = typeof tagsTable.$inferSelect;
export type NewTag = typeof tagsTable.$inferInsert;
