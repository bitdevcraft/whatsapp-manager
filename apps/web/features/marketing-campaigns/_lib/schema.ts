import { z } from "zod";

import { createStepSchema } from "@/components/forms/multi-step-form";
import { MessageTemplateSchema } from "@/features/whatsapp/templates/lib/schema";

export const MarketingCampaignFormSchema = createStepSchema({
  audience: z.object({
    phone: z.array(
      z.object({
        value: z.string(),
      })
    ),
    tags: z.array(z.string()),
  }),
  details: z.object({
    campaignName: z.string().min(3),
    description: z.string().optional(),
    phoneNumber: z.string().nonempty(),
    schedule: z.date().nullable(),
    track: z.boolean(),
  }),
  template: z.object({
    messageTemplate: MessageTemplateSchema,
    template: z.string().min(3),
  }),
});

export type MarketingCampaignFormValues = z.infer<
  typeof MarketingCampaignFormSchema
>;
