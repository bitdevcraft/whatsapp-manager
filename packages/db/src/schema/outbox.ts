import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { baseIdModel } from "./abstract/baseIdModel";
import { eventsTable } from "./events";
import { teamsTable } from "./teams";

export const outboxTable = pgTable("outbox", {
  ...baseIdModel,
  eventId: uuid("event_id")
    .references(() => eventsTable.id)
    .notNull(),
  processedAt: timestamp("processed_at"),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
});

export const outboxRelations = relations(outboxTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [outboxTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type NewOutbox = typeof outboxTable.$inferInsert;
export type Outbox = typeof outboxTable.$inferSelect;
