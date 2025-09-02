import { z } from "zod";

export const AdCampaignSchema = z.object({
  name: z.string(),
  objective: z.enum([
    "OUTCOME_ENGAGEMENT",
    "OUTCOME_LEADS",
    "OUTCOME_SALES",
    "OUTCOME_TRAFFIC",
  ]),
  special_ad_categories: z
    .enum([
      "NONE",
      "EMPLOYMENT",
      "HOUSING",
      "CREDIT",
      "ISSUES_ELECTIONS_POLITICS",
      "ONLINE_GAMBLING_AND_GAMING",
      "FINANCIAL_PRODUCTS_SERVICES",
    ])
    .array(),
  //   .optional()
  //   .default([]),
  status: z.enum(["PAUSED", "ACTIVE"]).optional(),
});

export const TargetingSchema = z.object({
  age_max: z.number().min(13).max(65),
  age_min: z.number().min(13).max(65),
  behaviors: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
  genders: z.array(z.number()),
  geo_locations: z.object({
    cities: z.array(
      z.object({
        distance_unit: z.string(),
        key: z.string(),
        radius: z.string(),
      })
    ),
    countries: z.array(z.string()),
    country_groups: z.array(z.string()),
    places: z.array(
      z.object({
        distance_unit: z.string(),
        key: z.string(),
        radius: z.string(),
      })
    ),
    regions: z.array(z.string()),
    zips: z.array(
      z.object({
        key: z.string(),
      })
    ),
  }),
  interest: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export const AdSetSchema = z
  .object({
    bid_amount: z.number().optional(),
    bid_strategy: z
      .enum(["LOWEST_COST_WITHOUT_CAP", "LOWEST_COST_WITH_BID_CAP", "COST_CAP"])
      .optional(),
    billing_event: z.enum(["IMPRESSIONS"]),
    daily_budget: z.number().optional(),
    destination_type: z.literal("WHATSAPP"),
    end_time: z.union([z.date(), z.literal(0)]).optional(),
    lifetime_budget: z.number().optional(),
    name: z.string(),
    optimization_goal: z.string(),
    promoted_object: z.object({
      page_id: z.string(),
      whatsapp_phone_number: z.string(),
    }),
    start_time: z.date().optional(),
    status: z.enum(["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"]).optional(),
    targeting: TargetingSchema,
    time_start: z.date().optional(),
    time_stop: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    const {
      bid_amount,
      bid_strategy,
      daily_budget,
      end_time,
      lifetime_budget,
      start_time,
    } = data;

    //  Bid Amount
    if (
      (bid_strategy === "LOWEST_COST_WITH_BID_CAP" ||
        bid_strategy === "COST_CAP") &&
      (bid_amount === undefined || bid_amount === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "`bid_amount` is required when `bid_strategy` is 'LOWEST_COST_WITH_BID_CAP' or 'COST_CAP'",
        path: ["bid_amount"],
      });
    }

    // daily budget
    const hasPositiveDaily =
      typeof daily_budget === "number" && daily_budget > 0;
    const hasPositiveLifetime =
      typeof lifetime_budget === "number" && lifetime_budget > 0;
    if (!hasPositiveDaily && !hasPositiveLifetime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Either daily_budget or lifetime_budget must be greater than 0",
        path: ["daily_budget"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Either daily_budget or lifetime_budget must be greater than 0",
        path: ["lifetime_budget"],
      });
    }

    if (hasPositiveDaily && (!start_time || !end_time)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "`daily_budget` is only allowed when end_time – start_time > 24 hours",
        path: ["daily_budget"],
      });
    }

    if (hasPositiveDaily && start_time && end_time) {
      const start = new Date(start_time).getTime();
      const end = new Date(end_time).getTime();
      if (end - start <= 24 * 60 * 60 * 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "daily_budget is only allowed when end_time – start_time > 24 hours",
          path: ["daily_budget"],
        });
      }
    }

    // end time
    if (hasPositiveLifetime) {
      if (end_time === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "end_time (as a valid date string or timestamp) is required when lifetime_budget is specified",
          path: ["end_time"],
        });
      }
    }
  });

export const MultiStepAdsSchema = z.object({
  adSet: AdSetSchema,
  campaign: AdCampaignSchema,
});

export type MultiStepAdsFormValues = z.infer<typeof MultiStepAdsSchema>;
