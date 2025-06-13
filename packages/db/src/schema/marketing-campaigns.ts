import { baseSchema } from "../helpers/column-helper";
import {
  varchar,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  jsonb,
  boolean,
  integer,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { enumToValues } from "../enums/enum-helper";
import { MarketingCampaignStatusEnum } from "../enums/status-enum";
import { templatesTable } from "./templates";
import { relations, sql } from "drizzle-orm";
import { teamsTable } from "./teams";

export const marketingCampaignStatusEnum = pgEnum(
  "status",
  enumToValues(MarketingCampaignStatusEnum)
);

export interface MarketingCampaignAnalytics {
  totalRecipients?: number;
  messageSent?: number;
  openRate?: number;
  replyRate?: number;
  engagement?: number;
}

export const marketingCampaignsTable = pgTable(
  "marketing_campaigns",
  {
    ...baseSchema,
    description: varchar("description", { length: 65_535 }),
    templateId: varchar("template_id")
      .references(() => templatesTable.id)
      .notNull(),
    scheduleAt: timestamp("schedule_at"),
    processedAt: timestamp("processed_at"),
    completedAt: timestamp("completed_at"),
    status: marketingCampaignStatusEnum(),
    enableTracking: boolean("enable_tracking").default(false),
    phoneNumber: varchar("phone_number", { length: 15 }),
    createdBy: uuid("created_by").references(() => usersTable.id),
    payload: jsonb("payload"),
    tags: jsonb("tags").$type<string[]>(),
    recipients: jsonb("recipients").$type<string[]>(),
    analytics: jsonb("analytics").$type<MarketingCampaignAnalytics>(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
  },
  (t) => [
    // only allow SELECTs where team_id matches the session var
    pgPolicy("marketing_campaigns_select_tenant", {
      for: "select",
      to: process.env.POSTGRES_USER_ROLE!, // <-- your DB role here
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // inserts must set team_id = current_tenant
    pgPolicy("marketing_campaigns_insert_tenant", {
      for: "insert",
      to: process.env.POSTGRES_USER_ROLE!,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // updates only on your rows, and team_id can't be changed
    pgPolicy("marketing_campaigns_update_tenant", {
      for: "update",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
      withCheck: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
    // deletes only your rows
    pgPolicy("marketing_campaigns_delete_tenant", {
      for: "delete",
      to: process.env.POSTGRES_USER_ROLE!,
      using: sql`${t.teamId} = current_setting('app.current_tenant')::uuid`,
    }),
  ]
);

export const marketingCampaignRelations = relations(
  marketingCampaignsTable,
  ({ one }) => ({
    template: one(templatesTable, {
      fields: [marketingCampaignsTable.templateId],
      references: [templatesTable.id],
    }),
    team: one(teamsTable, {
      fields: [marketingCampaignsTable.teamId],
      references: [teamsTable.id],
    }),
  })
);

export type MarketingCampaign = typeof marketingCampaignsTable.$inferSelect;
export type NewMarketingCampaign = typeof marketingCampaignsTable.$inferInsert;
