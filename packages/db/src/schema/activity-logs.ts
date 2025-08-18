import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { baseIdModel } from "./abstract/baseIdModel";
import { teamsTable } from "./teams";
import { usersTable } from "./users";

export const activityLogsTable = pgTable("activity_logs", {
  ...baseIdModel,
  action: text("action").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: uuid("user_id").references(() => usersTable.id),
});

export type ActivityLog = typeof activityLogsTable.$inferSelect;
export type NewActivityLog = typeof activityLogsTable.$inferInsert;

export const activityLogsRelations = relations(
  activityLogsTable,
  ({ one }) => ({
    team: one(teamsTable, {
      fields: [activityLogsTable.teamId],
      references: [teamsTable.id],
    }),
    user: one(usersTable, {
      fields: [activityLogsTable.userId],
      references: [usersTable.id],
    }),
  })
);
