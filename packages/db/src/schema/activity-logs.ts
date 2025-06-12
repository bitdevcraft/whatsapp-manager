import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { usersTable } from "./users";
import { relations } from "drizzle-orm";

export const activityLogsTable = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
  userId: uuid("user_id").references(() => usersTable.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
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
