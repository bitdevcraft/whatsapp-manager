import z from "zod";
import { AdLabelSchema } from "../ad-label";
import {
  BidStrategySchema,
  NumericStringSchema,
  ReadParameterSchema,
} from "../abstract/base-schema";

/**
 * PARAMETER
 */

export const AdCampaignReadParameterSchema = ReadParameterSchema;

export type AdCampaignReadParameter = z.infer<
  typeof AdCampaignReadParameterSchema
>;

/**
 * FIELDS
 */

const ConfiguredStatusSchema = z.enum([
  "ACTIVE",
  "PAUSED",
  "DELETED",
  "ARCHIVED",
]);

const EffectiveStatusSchema = z.enum([
  "ACTIVE",
  "PAUSED",
  "DELETED",
  "ARCHIVED",
  "IN_PROCESS",
  "WITH_ISSUES",
]);

const CampaignStatusSchema = z.enum([
  "ACTIVE",
  "PAUSED",
  "DELETED",
  "ARCHIVED",
]);

// TODO: create a proper schema
export const AdPromotedObject = z.any();

export const CampaignReadFields = z.object({
  id: NumericStringSchema.optional(),
  account_id: NumericStringSchema.optional(),
  adlabels: z.array(AdLabelSchema).optional(),
  bid_strategy: BidStrategySchema,
  boosted_object_id: NumericStringSchema.optional(),
  budget_rebalance_flag: z.boolean().optional(),
  budget_remaining: NumericStringSchema.optional(),
  buying_type: z.string().optional(),
  campaign_group_active_time: NumericStringSchema.optional(),
  can_create_brand_lift_study: z.boolean().optional(),
  can_use_spend_cap: z.boolean().optional(),
  configured_status: ConfiguredStatusSchema.optional(),
  created_time: z.date().optional(),
  daily_budget: NumericStringSchema.optional(),
  effective_status: EffectiveStatusSchema.optional(),
  has_secondary_skadnetwork_reporting: z.boolean().optional(),
  is_budget_schedule_enabled: z.boolean().optional(),
  is_skadnetwork_attribution: z.boolean().optional(),
  last_budget_toggling_time: z.date().optional(),
  lifetime_budget: NumericStringSchema.optional(),
  name: z.string().optional(),
  objective: z.string().optional(),
  pacing_type: z.array(z.string()).optional(),
  primary_attribution: z.string(),
  promoted_object: AdPromotedObject.optional(),
  smart_promotion_type: z.string().optional(),
  source_campaign: z.any().optional(),
  source_campaign_id: NumericStringSchema.optional(),
  special_ad_categories: z.array(z.string()).optional(),
  special_ad_category: z.string().optional(),
  special_ad_category_country: z.array(z.string()).optional(),
  spend_cap: NumericStringSchema.optional(),
  start_time: z.date().optional(),
  status: CampaignStatusSchema.optional(),
  stop_time: z.date().optional(),
  topline_id: NumericStringSchema.optional(),
  updated_time: z.date().optional(),
});
