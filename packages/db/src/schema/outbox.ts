import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { eventsTable } from "./events";
import { teamsTable } from "./teams";
import { relations } from "drizzle-orm";

export const outboxTable = pgTable("outbox", {
  id: uuid("id").defaultRandom().primaryKey(),
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

export type Outbox = typeof outboxTable.$inferSelect;
export type NewOutbox = typeof outboxTable.$inferInsert;
