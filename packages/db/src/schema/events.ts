import { baseSchema } from "../helpers/column.helper";
import {
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const eventsTable = pgTable("events", {
  // Unique ID for this event
  id: uuid("id").defaultRandom().primaryKey(),

  // Which aggregate (entity) this event is for…
  aggregateType: varchar("aggregate_type", { length: 100 }).notNull(),
  aggregateId: uuid("aggregate_id").notNull(),

  // What happened
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: jsonb("payload").notNull(),

  // Optimistic‐locking / ordering per aggregate
  version: integer("version").notNull(),

  // When it was created
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Event = typeof eventsTable.$inferSelect;
export type NewEvent = typeof eventsTable.$inferInsert;
