import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { createOrganizationPolicies } from "../policies/workspace";
import { baseIdModel } from "./abstract/baseIdModel";
import { teamsTable } from "./teams";

export const eventsTable = pgTable(
  "events",
  {
    // Unique ID for this event
    ...baseIdModel,

    aggregateId: uuid("aggregate_id").notNull(),
    // Which aggregate (entity) this event is for…
    aggregateType: varchar("aggregate_type", { length: 100 }).notNull(),

    // When it was created
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // What happened
    eventType: varchar("event_type", { length: 100 }).notNull(),

    payload: jsonb("payload").notNull(),

    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    // Optimistic‐locking / ordering per aggregate
    version: integer("version").notNull(),
  },
  (t) => [...createOrganizationPolicies("events", t)]
);

export const eventsRelations = relations(eventsTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [eventsTable.teamId],
    references: [teamsTable.id],
  }),
}));

export type Event = typeof eventsTable.$inferSelect;
export type NewEvent = typeof eventsTable.$inferInsert;
