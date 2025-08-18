import { LanguagesEnum } from "@workspace/wa-cloud-api";
import z from "zod";

export const MessageTemplateSchema = z.object({
    name: z.string(),
    language: z.nativeEnum(LanguagesEnum)
})