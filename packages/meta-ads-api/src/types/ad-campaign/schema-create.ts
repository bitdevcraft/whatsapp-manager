import z from "zod";
import { AdLabelSchema } from "../ad-label";
import { CategoryCountryCode, DefaultStatus } from "../abstract/base-enums";
import { BidStrategySchema, NumericStringSchema } from "../abstract/base-schema";
import {
  AdObjectTypeList,
  CampaignObjectiveList,
  CustomEventTypeList,
  LeadAdsCustomEventTypeList,
  VariationList,
} from "./enum";

/**
 * Response
 */

export const AdCampaignResponseSchema = z.object({
  id: NumericStringSchema.optional(),
  success: z.boolean().optional(),
});

/**
 * POST : /act_{ad_account_id}/async_batch_requests
 */
export const AdBatchSchema = z.object({
  name: z.string(),
  relative_url: z.string(),
  body: z.string(),
});

export const AsyncBatchRequestPayloadSchema = z.object({
  adbatch: z.array(AdBatchSchema),
  name: z.string(),
});

export type AsyncBatchRequestPayload = z.infer<
  typeof AsyncBatchRequestPayloadSchema
>;

/**
 * POST : /{campaign_id}/copies
 */

export const RenameOptionsSchema = z.object({
  rename_strategy: z.enum([
    "DEEP_RENAME",
    "ONLY_TOP_LEVEL_RENAME",
    "NO_RENAME",
  ]),
  rename_prefix: z.string().optional(),
  rename_suffix: z.string().optional(),
});

export const AdCampaignCopiesSchema = z.object({
  deep_copy: z.boolean().default(false),
  end_time: z.date().optional(),
  rename_options: RenameOptionsSchema.optional(),
  start_time: z.date().optional(),
  status_option: z.enum(["ACTIVE", "PAUSED", "INHERITED_FROM_SOURCE"]),
});

export type AdCampaignCopies = z.infer<typeof AdCampaignCopiesSchema>;

export const AdCampaignCopiesResponseSchema = z.object({
  copied_campaign_id: NumericStringSchema.optional(),
  ad_object_ids: z.array(
    z.object({
      ad_object_type: z.enum(AdObjectTypeList).optional(),
      source_id: NumericStringSchema.optional(),
      copied_id: NumericStringSchema.optional(),
    })
  ),
});

export type AdCampaignCopiesResponse = z.infer<
  typeof AdCampaignCopiesResponseSchema
>;

/**
 * POST : /act_{ad_account_id}/campaigns
 */

export const BudgetScheduleSpec = z.object({
  id: z.number().optional(),
  time_start: z.date().optional(),
  time_end: z.date().optional(),
  budget_value: z.number().optional(),
  budget_value_type: z.enum(["ABSOLUTE", "MULTIPLIER"]).optional(),
  recurrence_type: z.enum(["ONE_TIME", "WEEKLY"]).optional(),
  weekly_schedule: z
    .array(
      z.object({
        days: z.array(z.number()).optional(),
        minute_start: z.number().optional(),
        minute_end: z.number().optional(),
        timezone_type: z.string().optional(),
      })
    )
    .optional(),
});

export const CampaignObjectiveSchema = z.enum(CampaignObjectiveList);

export const CustomEventTypeSchema = z.enum(CustomEventTypeList);

export const LeadAdsCustomEventTypeSchema = z.enum(LeadAdsCustomEventTypeList);

export const PromotedObjectSchema = z.object({
  application_id: z.number(),
  pixel_id: NumericStringSchema,
  custom_event_type: CustomEventTypeSchema,
  object_store_url: z.string().optional(),
  object_store_urls: z.array(z.string()).optional(),
  offer_id: NumericStringSchema.optional(),
  page_id: NumericStringSchema.optional(),
  product_catalog_id: NumericStringSchema.optional(),
  product_item_id: NumericStringSchema.optional(),
  instagram_profile_id: NumericStringSchema.optional(),
  product_set_id: NumericStringSchema.optional(),
  event_id: NumericStringSchema.optional(),
  offline_conversion_data_set_id: NumericStringSchema.optional(),
  fundraiser_campaign_id: NumericStringSchema.optional(),
  custom_event_str: z.string().optional(),
  mcme_conversion_id: NumericStringSchema.optional(),
  conversion_goal_id: NumericStringSchema.optional(),
  offsite_conversion_event_id: NumericStringSchema.optional(),
  boosted_product_set_id: NumericStringSchema.optional(),
  lead_ads_form_event_source_type: LeadAdsCustomEventTypeSchema.optional(),
  lead_ads_custom_event_str: z.string().optional(),
  lead_ads_offsite_conversion_type: z.enum(["default", "clo"]),
  value_semantic_type: z.enum(["VALUE", "MARGIN", "LIFETIME_VALUE"]).optional(),
  variation: z.enum(VariationList).optional(),
  product_set_optimization: z.enum(["enabled", "disabled"]).optional(),
  full_funnel_objective: z
    .enum([
      "6",
      "8",
      "12",
      "14",
      "15",
      "19",
      "24",
      "26",
      "29",
      "31",
      "32",
      "35",
      "36",
      "37",
      "39",
      "41",
      "42",
      "40",
      "43",
      "44",
      "46",
    ])
    .optional(),
  dataset_split_id: NumericStringSchema.optional(),
  omnichannel_object: z
    .object({
      app: z.record(z.string(), z.any()).optional(),
      pixel: z.record(z.string(), z.any()),
      onsite: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
  whats_app_business_phone_number_id: NumericStringSchema.optional(),
  whatsapp_phone_number: z.string().optional(),
});

export const AdCampaignSchema = z.object({
  adlabels: z.array(AdLabelSchema).optional(),
  bid_strategy: BidStrategySchema.optional(),
  budget_schedule_specs: z.array(BudgetScheduleSpec).optional(),
  buying_type: z.string().default("AUCTION"),
  campaign_optimization_type: z.enum(["NONE", "ICO_ONLY"]).optional(),
  daily_budget: z.number().optional(),
  execution_options: z
    .array(z.enum(["validate_only", "include_recommendations"]))
    .optional(),
  is_skadnetwork_attribution: z.boolean().optional(),
  is_using_l3_schedule: z.boolean().optional(),
  iterative_split_test_configs: z.array(z.any()),
  lifetime_budget: z.number().optional(),
  name: z.string(),
  objective: CampaignObjectiveSchema,
  promoted_object: PromotedObjectSchema,
  source_campaign_id: NumericStringSchema.optional(),
  special_ad_categories: z.array(
    z.enum([
      "NONE",
      "EMPLOYMENT",
      "HOUSING",
      "CREDIT",
      "ISSUES_ELECTIONS_POLITICS",
      "ONLINE_GAMBLING_AND_GAMING",
      "FINANCIAL_PRODUCTS_SERVICES",
    ])
  ),
  special_ad_category_country: z.array(z.enum(CategoryCountryCode)).optional(),
  spend_cap: z.number().optional(),
  start_time: z.date().optional(),
  status: z.enum(DefaultStatus).optional(),
  stop_time: z.date().optional(),
  topline_id: z.string().optional(),
});

/**
 * Update
 */

/**
 * POST :  /{campaign_id}
 */

export const AdCampaignUpdate = z.object({
  adlabels: z.array(AdLabelSchema).optional(),
  adset_bid_amounts: z.map(NumericStringSchema, z.number()),
  adset_budgets: z.array(
    z.object({
      adset_id: NumericStringSchema,
      daily_budget: z.number().optional(),
      lifetime_budget: z.number().optional(),
    })
  ),
  bid_strategy: BidStrategySchema.optional(),
  budget_rebalance_flag: z.boolean().optional(),
  campaign_optimization_type: z.enum(["NONE", "ICO_ONLY"]).optional(),
  daily_budget: z.number().optional(),
  execution_options: z
    .array(z.enum(["validate_only", "include_recommendations"]))
    .optional(),
  is_skadnetwork_attribution: z.boolean().optional(),
  is_using_l3_schedule: z.boolean().optional(),
  iterative_split_test_configs: z.array(z.any()),
  lifetime_budget: z.number().optional(),
  name: z.string(),
  objective: CampaignObjectiveSchema.optional(),
  promoted_object: PromotedObjectSchema,
  smart_promotion_type: z.enum(["GUIDED_CREATION", "SMART_APP_PROMOTION"]),
  special_ad_categories: z.array(
    z.enum([
      "NONE",
      "EMPLOYMENT",
      "HOUSING",
      "CREDIT",
      "ISSUES_ELECTIONS_POLITICS",
      "ONLINE_GAMBLING_AND_GAMING",
      "FINANCIAL_PRODUCTS_SERVICES",
    ])
  ),
  special_ad_category: z.array(
    z.enum([
      "NONE",
      "EMPLOYMENT",
      "HOUSING",
      "CREDIT",
      "ISSUES_ELECTIONS_POLITICS",
      "ONLINE_GAMBLING_AND_GAMING",
      "FINANCIAL_PRODUCTS_SERVICES",
    ])
  ),
  special_ad_category_country: z.array(z.enum(CategoryCountryCode)).optional(),
  spend_cap: z.number().optional(),
  start_time: z.date().optional(),
  status: z.enum(DefaultStatus).optional(),
  stop_time: z.date().optional(),
});
