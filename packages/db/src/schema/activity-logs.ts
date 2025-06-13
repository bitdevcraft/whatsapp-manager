import {
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { usersTable } from "./users";
import { relations, sql } from "drizzle-orm";

export const activityLogsTable = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    userId: uuid("user_id").references(() => usersTable.id),
    action: text("action").notNull(),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
    ipAddress: varchar("ip_address", { length: 45 }),
  }
  // (t) => [
  //   // only allow SELECTs where team_id matches the session var
  //   pgPolicy("activity_logs_select_tenant", {
  //     for: "select",
  //     to: process.env.POSTGRES_USER_ROLE!, // <-- your DB role here
  //     using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
  //   }),
  //   // inserts must set team_id = current_tenant
  //   pgPolicy("activity_logs_insert_tenant", {
  //     for: "insert",
  //     to: process.env.POSTGRES_USER_ROLE!,
  //     withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
  //   }),
  //   // updates only on your rows, and team_id can't be changed
  //   pgPolicy("activity_logs_update_tenant", {
  //     for: "update",
  //     to: process.env.POSTGRES_USER_ROLE!,
  //     using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
  //     withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
  //   }),
  //   // deletes only your rows
  //   pgPolicy("activity_logs_delete_tenant", {
  //     for: "delete",
  //     to: process.env.POSTGRES_USER_ROLE!,
  //     using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
  //   }),
  // ]
);

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
