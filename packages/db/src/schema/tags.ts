import { baseSchema } from "../helpers/column-helper";
import { relations, sql, SQL } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";

export const tagsTable = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  name: varchar("name", { length: 255 }).notNull(),
  normalizedName: varchar("normalized_name", { length: 255 }).generatedAlwaysAs(
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
});

export const tagsRelations = relations(tagsTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [tagsTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type Tag = typeof tagsTable.$inferSelect;
export type NewTag = typeof tagsTable.$inferInsert;
