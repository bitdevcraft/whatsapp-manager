import { relations, sql, SQL } from "drizzle-orm";
import { pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

import { createOrganizationPolicies } from "../policies/workspace";
import { baseIdModel } from "./abstract/baseIdModel";
import { teamsTable } from "./teams";

export const tagsTable = pgTable(
  "tags",
  {
    ...baseIdModel,
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
    updatedAt: timestamp("updated_at"),
  },
  (t) => [
    ...createOrganizationPolicies("tags", t),
    unique("tags_per_team").on(t.teamId, t.name),
  ]
);

export const tagsRelations = relations(tagsTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [tagsTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type NewTag = typeof tagsTable.$inferInsert;
export type Tag = typeof tagsTable.$inferSelect;
