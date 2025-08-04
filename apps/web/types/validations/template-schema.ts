import { MessageTemplateSchema } from "@/features/whatsapp/templates/lib/schema";
import z from "zod";

export const templateSendSchema = z.object({
  template: z.object({
    template: z.string().min(3),
    messageTemplate: MessageTemplateSchema,
  }),
  phone: z.string(),
  contactId: z.string(),
  templateId: z.string(),
});

export type TemplateSendValue = z.infer<typeof templateSendSchema>;
