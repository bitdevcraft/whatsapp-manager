import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
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
    sentCount: integer("sent_count").default(0),
    deliveredCount: integer("delivered_count").default(0),
    failedCount: integer("failed_count").default(0),
    errorSummary: jsonb("error_summary").$type<Record<string, number>>(),
  },
  (t) => [...createOrganizationPolicies("marketing_campaigns", t)]
);

export const marketingCampaignRelations = relations(
  marketingCampaignsTable,
  ({ one, many }) => ({
    team: one(teamsTable, {
      fields: [marketingCampaignsTable.teamId],
      references: [teamsTable.id],
    }),
    template: one(templatesTable, {
      fields: [marketingCampaignsTable.templateId],
      references: [templatesTable.id],
    }),
    errorLogs: many(campaignErrorLogsTable),
    messageStatuses: many(campaignMessageStatusTable),
  })
);

// Error types for campaign error classification
export enum CampaignErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  TEMPLATE_ERROR = "TEMPLATE_ERROR",
  RATE_LIMIT = "RATE_LIMIT",
  AUTH_ERROR = "AUTH_ERROR",
  INVALID_RECIPIENT = "INVALID_RECIPIENT",
  WHATSAPP_API_ERROR = "WHATSAPP_API_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Status for individual campaign messages
export enum CampaignMessageStatus {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

// Table for logging all errors encountered during campaign processing
export const campaignErrorLogsTable = pgTable(
  "campaign_error_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    marketingCampaignId: uuid("marketing_campaign_id")
      .references(() => marketingCampaignsTable.id, { onDelete: "cascade" }),
    teamId: uuid("team_id").notNull(),
    recipientPhone: varchar("recipient_phone", { length: 20 }),
    errorType: varchar("error_type", { length: 100 }),
    errorMessage: varchar("error_message", { length: 65535 }),
    errorStack: text("error_stack"),
    jobData: jsonb("job_data"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// Table for tracking individual message status within a campaign
export const campaignMessageStatusTable = pgTable(
  "campaign_message_status",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    marketingCampaignId: uuid("marketing_campaign_id")
      .references(() => marketingCampaignsTable.id, { onDelete: "cascade" }),
    teamId: uuid("team_id").notNull(),
    recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),
    wamid: varchar("wamid", { length: 100 }),
    status: varchar("status", { length: 50 }).notNull(),
    errorCode: varchar("error_code", { length: 100 }),
    errorMessage: varchar("error_message", { length: 65535 }),
    retryCount: integer("retry_count").default(0),
    canRetry: boolean("can_retry").default(true),
    sentAt: timestamp("sent_at"),
    deliveredAt: timestamp("delivered_at"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const campaignErrorLogsRelations = relations(
  campaignErrorLogsTable,
  ({ one }) => ({
    campaign: one(marketingCampaignsTable, {
      fields: [campaignErrorLogsTable.marketingCampaignId],
      references: [marketingCampaignsTable.id],
    }),
  })
);

export const campaignMessageStatusRelations = relations(
  campaignMessageStatusTable,
  ({ one }) => ({
    campaign: one(marketingCampaignsTable, {
      fields: [campaignMessageStatusTable.marketingCampaignId],
      references: [marketingCampaignsTable.id],
    }),
  })
);

export type MarketingCampaign = typeof marketingCampaignsTable.$inferSelect;
export type MarketingCampaignWithTemplate = MarketingCampaign & {
  template: Template;
};
export type NewMarketingCampaign = typeof marketingCampaignsTable.$inferInsert;
