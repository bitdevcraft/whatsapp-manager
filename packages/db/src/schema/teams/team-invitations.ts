import { pgTable, uuid } from "drizzle-orm/pg-core";

import { baseModel } from "../abstract/baseModel";
import { teamsTable } from "./teams";
const { name, ...model } = baseModel;

export const teamInvitationsTable = pgTable("team_invitations", {
  ...model,
  organizationId: uuid("organization_id")
    .references(() => teamsTable.id)
    .notNull(),
});
