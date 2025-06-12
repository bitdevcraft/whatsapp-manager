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
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { enumToValues } from "../enums/enum-helper";
import { MarketingCampaignStatusEnum } from "../enums/status-enum";
import { templatesTable } from "./templates";
import { relations } from "drizzle-orm";
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

export const marketingCampaignsTable = pgTable("marketing_campaigns", {
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
});

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
