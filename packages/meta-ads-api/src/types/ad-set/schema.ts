import z from "zod";
import { AdLabelSchema } from "../ad-label";
import {
  BidStrategySchema,
  NumericStringSchema,
  ReadParameterSchema,
} from "../abstract/base-schema";
import { BillingEventList, OptimizationGoalList } from "./enum";
import { DefaultStatus } from "../abstract/base-enums";
import { AdPromotedObject } from "../ad-campaign";

/**
 * PARAMETER
 */

export const AdSetReadParameterSchema = ReadParameterSchema;

export type AdSetReadParameter = z.infer<typeof AdSetReadParameterSchema>;

export const AdBidAdjustmentSchema = z.object({
  age_range: z.map(z.string(), z.number()).optional(),
  page_types: z.string().optional(),
  user_groups: z.string().optional(),
});

export const AdCampaignIssuesInfoSchema = z.object({
  error_code: z.number(),
  error_message: z.string(),
  error_summary: z.string(),
  error_type: z.string(),
  level: z.string(),
});

export const AdCampaignLearningStageInfoSchema = z.object({
  attribution_windows: z.array(z.string()).optional(),
  conversions: z.number().optional(),
  last_sig_edit_ts: z.number().optional(),
  status: z.enum(["LEARNING", "SUCCESS", "FAIL"]).optional(),
});

export const AdSetReadFieldSchema = z.object({
  id: NumericStringSchema.optional(),
  account_id: NumericStringSchema.optional(),
  adlabels: z.array(AdLabelSchema).optional(),
  adset_schedule: z.array(z.any()).optional(),
  asset_feed_id: NumericStringSchema.optional(),
  attribution_spec: z.array(z.any()).optional(),
  bid_adjustments: AdBidAdjustmentSchema,
  bid_amount: z.number().optional(),
  bid_constraints: z.any().optional(),
  bid_info: z.map(z.string(), z.number()).optional(),
  bid_strategy: BidStrategySchema.optional(),
  billing_event: z.enum(BillingEventList).optional(),
  brand_safety_config: z.any().optional(),
  budget_remaining: NumericStringSchema.optional(),
  campaign_active_time: NumericStringSchema.optional(),
  campaign_attribution: z.string().optional(),
  campaign_id: NumericStringSchema.optional(),
  configured_status: z.enum(DefaultStatus).optional(),
  created_time: z.date().optional(),
  creative_sequence: z.array(NumericStringSchema).optional(),
  daily_budget: NumericStringSchema.optional(),
  daily_min_spend_target: NumericStringSchema.optional(),
  daily_spend_cap: NumericStringSchema.optional(),
  destination_type: z.string().optional(),
  dsa_beneficiary: z.string().optional(),
  dsa_payor: z.string().optional(),
  effective_status: z
    .enum([
      "ACTIVE",
      "PAUSED",
      "DELETED",
      "CAMPAIGN_PAUSED",
      "ARCHIVED",
      "IN_PROCESS",
      "WITH_ISSUES",
    ])
    .optional(),
  end_time: z.date().optional(),
  frequency_control_specs: z.array(
    z.object({
      event: z.enum(["IMPRESSIONS"]).default("IMPRESSIONS"),
      interval_days: z.number().min(1).max(90),
      max_frequency: z.number().min(1).max(90),
    })
  ),
  instagram_user_id: NumericStringSchema.optional(),
  is_dynamic_creative: z.boolean().optional(),
  is_incremental_attribution_enabled: z.boolean().optional(),
  issues_info: z.array(AdCampaignIssuesInfoSchema),
  learning_stage_info: AdCampaignLearningStageInfoSchema,
  lifetime_budget: NumericStringSchema.optional(),
  lifetime_imps: z.number().optional(),
  lifetime_min_spend_target: NumericStringSchema.optional(),
  lifetime_spend_cap: NumericStringSchema.optional(),
  min_budget_spend_percentage: NumericStringSchema.optional(),
  multi_optimization_goal_weight: z.string().optional(),
  name: z.string().optional(),
  optimization_goal: z.enum(OptimizationGoalList).optional(),
  optimization_sub_event: z.string().optional(),
  pacing_type: z.array(z.string()).optional(),
  promoted_object: AdPromotedObject,
  recommendations: z.array(z.any()).optional(),
  recurring_budget_semantics: z.boolean().optional(),
  regional_regulated_categories: z.array(
    z
      .enum([
        "TAIWAN_FINSERV",
        "AUSTRALIA_FINSERV",
        "TAIWAN_UNIVERSAL",
        "SINGAPORE_UNIVERSAL",
      ])
      .nullable()
  ),
  regional_regulation_identities: z.any().optional(),
  review_feedback: z.string().optional(),
  rf_prediction_id: z.string().optional(),
  source_adset: z.any(),
  source_adset_id: NumericStringSchema.optional(),
  start_time: z.date().optional(),
  status: z.enum(DefaultStatus).optional(),
  targeting: z.any(),
  targeting_optimization_types: z.array(z.record(z.number())).optional(),
  time_based_ad_rotation_id_blocks: z.array(z.array(z.number())).optional(),
  time_based_ad_rotation_intervals: z.array(z.number()).optional(),
  updated_time: z.date().optional(),
  use_new_app_click: z.boolean().optional(),
  value_rule_set_id: NumericStringSchema.optional(),
});

export type AdSetReadField = z.infer<typeof AdSetReadFieldSchema>;

/**
 * Creating
 */

/**
 * POST : /{ad_set_id}/copies
 */

export const AdSetCopiesPayloadSchema = z.object({
  campaign_id: NumericStringSchema.optional(),
  deep_copy: z.boolean().default(false),
  end_time: z.date().optional(),
  rename_options: z.record(z.any()).optional(),
  start_time: z.date().optional(),
  status_option: z
    .enum(["ACTIVE", "PAUSED", "INHERITED_FROM_SOURCE"])
    .default("PAUSED"),
});

export type AdSetCopiesPayload = z.infer<typeof AdSetCopiesPayloadSchema>;

export const AdSetCopiesResponseSchema = z.object({
  copied_adset_id: NumericStringSchema.optional(),
  ad_object_ids: z.array(
    z.object({
      ad_object_type: z.enum([
        "unique_adcreative",
        "ad",
        "ad_set",
        "campaign",
        "opportunities",
        "privacy_info_center",
        "topline",
        "ad_account",
        "product",
      ]),
      source_id: NumericStringSchema.optional(),
      copied_id: NumericStringSchema.optional(),
    })
  ),
});

/**
 * POST : /act_{ad_account_id}/adsets
 */
