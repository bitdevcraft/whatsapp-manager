import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { eventsTable } from "./events";

export const outboxTable = pgTable("outbox", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .references(() => eventsTable.id)
    .notNull(),
  processedAt: timestamp("processed_at"),
});

export type Outbox = typeof outboxTable.$inferSelect;
export type NewOutbox = typeof outboxTable.$inferInsert;
