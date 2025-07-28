import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { baseModel } from "../abstract/baseModel";
import { usersTable } from "./users";
import { teamsTable } from "../teams";
const { name, ...model } = baseModel;

export const userSessionsTable = pgTable("user_sessions", {
  ...model,
  activeOrganizationId: uuid("active_organization_id").references(
    () => teamsTable.id
  ),
  expiresAt: timestamp("expires_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  ipAddress: varchar("ip_address", { length: 100 }),
  token: text("token"),
  userAgent: varchar("user_agent", { length: 255 }),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
});
