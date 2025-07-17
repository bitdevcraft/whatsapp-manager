import { DateOnlySchema, IntegerString } from "@/utils/zod-helper";
import z from "zod";
import { DatePreset } from "./base-enums";

export const TimeRangeSchema = z.object({
  since: DateOnlySchema,
  until: DateOnlySchema,
});

export const DatePresetSchema = z.enum(DatePreset);

export const NumericStringSchema = IntegerString(z.number());

export const BidStrategySchema = z.enum([
  "LOWEST_COST_WITHOUT_CAP",
  "LOWEST_COST_WITH_BID_CAP",
  "COST_CAP",
  "LOWEST_COST_WITH_MIN_ROAS",
]);

export const ReadParameterSchema = z.object({
  date_preset: DatePresetSchema.optional(),
  time_range: TimeRangeSchema.optional(),
});
