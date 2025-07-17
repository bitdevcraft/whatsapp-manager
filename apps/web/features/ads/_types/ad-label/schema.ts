import { z } from "zod";
import { AdAccountReadResponseSchema } from "../ad-account";
import { NumericStringSchema } from "../abstract/base-schema";

export const AdLabelSchema = z.object({
  id: NumericStringSchema.optional(),
  account: AdAccountReadResponseSchema.optional(),
  created_time: z.date().optional(),
  name: z.string().optional(),
  updated_time: z.date().optional(),
});

export type AdLabel = z.infer<typeof AdLabelSchema>;

export const AdLabelPayloadSchema = z.object({
  name: z.string(),
});

export type AdLabelPayload = z.infer<typeof AdLabelPayloadSchema>;
