import { createStepSchema } from "@/components/forms/multi-step-form";
import { MessageTemplateSchema } from "@/features/templates/lib/schema";
import { z } from "zod";

export const MarketingCampaignFormSchema = createStepSchema({
  template: z.object({
    template: z.string().min(3),
    messageTemplate: MessageTemplateSchema,
  }),
  audience: z.object({
    tags: z.array(z.string()),
    phone: z.array(
      z.object({
        value: z.string(),
      })
    ),
  }),
  details: z.object({
    campaignName: z.string().min(3),
    description: z.string().optional(),
    phoneNumber: z.string().nonempty(),
    schedule: z.date().nullable(),
    track: z.boolean(),
  }),
});

export type MarketingCampaignFormValues = z.infer<
  typeof MarketingCampaignFormSchema
>;
