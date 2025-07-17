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
  genders: z.array(z.number()),
  interest: z.object({
    id: z.string(),
    name: z.string(),
  }),
  geo_locations: z.object({
    countries: z.array(z.string()),
    regions: z.array(z.string()),
    cities: z.array(
      z.object({
        key: z.string(),
        radius: z.string(),
        distance_unit: z.string(),
      })
    ),
    zips: z.array(
      z.object({
        key: z.string(),
      })
    ),
    places: z.array(
      z.object({
        key: z.string(),
        radius: z.string(),
        distance_unit: z.string(),
      })
    ),
    country_groups: z.array(z.string()),
  }),
  behaviors: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
});

export const AdSetSchema = z.object({
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
});
// .superRefine((data, ctx) => {
//   const {
//     start_time,
//     end_time,
//     daily_budget,
//     lifetime_budget,
//     bid_strategy,
//     bid_amount,
//   } = data;

//   //  Bid Amount
//   if (
//     (bid_strategy === "LOWEST_COST_WITH_BID_CAP" ||
//       bid_strategy === "COST_CAP") &&
//     (bid_amount === undefined || bid_amount === 0)
//   ) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["bid_amount"],
//       message:
//         "`bid_amount` is required when `bid_strategy` is 'LOWEST_COST_WITH_BID_CAP' or 'COST_CAP'",
//     });
//   }

//   // daily budget
//   const hasPositiveDaily =
//     typeof daily_budget === "number" && daily_budget > 0;
//   const hasPositiveLifetime =
//     typeof lifetime_budget === "number" && lifetime_budget > 0;
//   if (!hasPositiveDaily && !hasPositiveLifetime) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["daily_budget"],
//       message:
//         "Either daily_budget or lifetime_budget must be greater than 0",
//     });
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["lifetime_budget"],
//       message:
//         "Either daily_budget or lifetime_budget must be greater than 0",
//     });
//   }

//   if (hasPositiveDaily && (!start_time || !end_time)) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["daily_budget"],
//       message:
//         "`daily_budget` is only allowed when end_time – start_time > 24 hours",
//     });
//   }

//   if (hasPositiveDaily && start_time && end_time) {
//     const start = new Date(start_time).getTime();
//     const end = new Date(end_time).getTime();
//     if (end - start <= 24 * 60 * 60 * 1000) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["daily_budget"],
//         message:
//           "daily_budget is only allowed when end_time – start_time > 24 hours",
//       });
//     }
//   }

//   // end time
//   if (hasPositiveLifetime) {
//     if (end_time === undefined) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["end_time"],
//         message:
//           "end_time (as a valid date string or timestamp) is required when lifetime_budget is specified",
//       });
//     }
//   }
// });

export const MultiStepAdsSchema = z.object({
  campaign: AdCampaignSchema,
  adSet: AdSetSchema,
});

export type MultiStepAdsFormValues = z.infer<typeof MultiStepAdsSchema>;
