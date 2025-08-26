import {
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "../../helpers/column-helper";
import { createOrganizationPolicies } from "../../policies/workspace";
import { baseIdModel } from "../abstract/baseIdModel";
import { usersTable } from "../users";
import { teamsTable } from "./teams";

export const teamMembersUsageTracking = pgTable(
  "team_members_usage_tracking",
  {
    ...baseIdModel,
    periodEnd: timestamp("period_end"),
    periodStart: timestamp("period_start"),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    ...timestamps,
    usageCount: integer("usage_count").notNull().default(0),
    userId: uuid("user_id")
      .references(() => usersTable.id)
      .notNull(),
  },
  (t) => [
    ...createOrganizationPolicies("team_members_usage_tracking", t),
    uniqueIndex("team_members_usage_tracking_unique").on(
      t.teamId,
      t.periodEnd,
      t.periodStart,
      t.userId
    ),
  ]
);
