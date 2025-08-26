import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "../../helpers/column-helper";
import { createOrganizationPolicies } from "../../policies/workspace";
import { baseIdModel } from "../abstract/baseIdModel";
import { usersTable } from "../users";
import { teamsTable } from "./teams";

export const limitType = pgEnum("limit_type", ["inherited", "custom"]);
export const maxLimitType = pgEnum("max_limit_type", ["one-time", "recurring"]);

export const teamMemberLimitsTable = pgTable(
  "team_member_limits",
  {
    ...baseIdModel,
    limitType: limitType().default("inherited"),
    maxLimit: integer("max_limit"),
    maxLimitType: maxLimitType("max_limit_type").default("recurring"),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    userId: uuid("user_id")
      .references(() => usersTable.id)
      .notNull(),
    ...timestamps,
  },
  (t) => [
    ...createOrganizationPolicies("team_member_limits", t),
    uniqueIndex("team_member_limits_unique").on(
      t.teamId,

      t.userId
    ),
  ]
);

export const TeamMembersLimitRelation = relations(
  teamMemberLimitsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [teamMemberLimitsTable.userId],
      references: [usersTable.id],
    }),
  })
);
