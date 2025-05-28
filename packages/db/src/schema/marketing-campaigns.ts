import { baseSchema } from "../helpers/column.helper";
import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { enumToValues } from "../enums/enum-helper";
import { MarketingCampaignStatusEnum } from "../enums/status-enum";
import { templatesTable } from "./templates";

export const marketingCampaignStatusEnum = pgEnum(
  "status",
  enumToValues(MarketingCampaignStatusEnum)
);

export const marketingCampaignsTable = pgTable("marketing_campaigns", {
  ...baseSchema,
  templateId: uuid("template_id")
    .references(() => templatesTable.id)
    .notNull(),
  scheduleAt: timestamp("schedule_at"),
  status: marketingCampaignStatusEnum(),
  createdBy: uuid("created_by").references(() => usersTable.id),
});

export type MarketingCampaign = typeof marketingCampaignsTable.$inferSelect;
export type NewMarketingCampaign = typeof marketingCampaignsTable.$inferInsert;
