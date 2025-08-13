import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { enumToValues } from "../enums/enum-helper";
import { MarketingCampaignStatusEnum } from "../enums/status-enum";
import { createOrganizationPolicies } from "../policies/workspace";
import { baseModel } from "./abstract/baseModel";
import { teamsTable } from "./teams";
import { Template, templatesTable } from "./templates";
import { usersTable } from "./users";

export const marketingCampaignStatusEnum = pgEnum(
  "status",
  enumToValues(MarketingCampaignStatusEnum)
);

export interface MarketingCampaignAnalytics {
  engagement?: number;
  messageSent?: number;
  openRate?: number;
  replyRate?: number;
  totalRecipients?: number;
}

export const marketingCampaignsTable = pgTable(
  "marketing_campaigns",
  {
    ...baseModel,
    analytics: jsonb("analytics").$type<MarketingCampaignAnalytics>(),
    completedAt: timestamp("completed_at"),
    createdBy: uuid("created_by").references(() => usersTable.id),
    description: varchar("description", { length: 65_535 }),
    enableTracking: boolean("enable_tracking").default(false),
    messageTemplate: jsonb("message_template"),
    payload: jsonb("payload"),
    phoneNumber: varchar("phone_number", { length: 15 }),
    processedAt: timestamp("processed_at"),
    recipients: jsonb("recipients").$type<string[]>(),
    scheduleAt: timestamp("schedule_at"),
    status: marketingCampaignStatusEnum(),
    tags: jsonb("tags").$type<string[]>(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teamsTable.id),
    templateId: varchar("template_id")
      .references(() => templatesTable.id)
      .notNull(),
    totalRecipients: integer("total_recipients"),
  },
  (t) => [...createOrganizationPolicies("marketing_campaigns", t)]
);

export const marketingCampaignRelations = relations(
  marketingCampaignsTable,
  ({ one }) => ({
    team: one(teamsTable, {
      fields: [marketingCampaignsTable.teamId],
      references: [teamsTable.id],
    }),
    template: one(templatesTable, {
      fields: [marketingCampaignsTable.templateId],
      references: [templatesTable.id],
    }),
  })
);

export type MarketingCampaign = typeof marketingCampaignsTable.$inferSelect;
export type MarketingCampaignWithTemplate = MarketingCampaign & {
  template: Template;
};
export type NewMarketingCampaign = typeof marketingCampaignsTable.$inferInsert;
