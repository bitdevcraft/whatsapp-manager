import z from "zod";

import { MessageTemplateSchema } from "@/features/whatsapp/templates/lib/schema";

export const templateSendSchema = z.object({
  contactId: z.string(),
  phone: z.string(),
  template: z.object({
    messageTemplate: MessageTemplateSchema,
    template: z.string().min(3),
  }),
  templateId: z.string(),
});

export type TemplateSendValue = z.infer<typeof templateSendSchema>;
