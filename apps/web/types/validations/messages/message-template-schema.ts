import { LanguagesEnum } from "@workspace/wa-cloud-api";
import z from "zod";

export const MessageTemplateSchema = z.object({
  language: z.nativeEnum(LanguagesEnum),
  name: z.string(),
});

export type MessageTemplateValue = z.infer<typeof MessageTemplateSchema>;
