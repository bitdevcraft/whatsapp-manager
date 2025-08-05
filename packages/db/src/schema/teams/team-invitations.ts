import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { baseModel } from "../abstract/baseModel";
import { teamsTable } from "./teams";
import { usersTable } from "../users";
const { name, ...model } = baseModel;

export const teamInvitationsTable = pgTable("team_invitations", {
  ...model,
  email: varchar("email", { length: 255 }),
  expiresAt: timestamp("expires_at"),
  inviterId: uuid("inviter_id").references(() => usersTable.id),
  organizationId: uuid("organization_id")
    .references(() => teamsTable.id)
    .notNull(),
  role: varchar("role", { length: 255 }),
  status: varchar("status", { length: 255 }),
});
