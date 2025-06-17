import { z } from "zod";
import {
  ComponentTypesEnum,
  ParametersTypesEnum,
  SubTypeEnum,
  ButtonPositionEnum,
  LanguagesEnum,
  CurrencyCodesEnum,
} from "@workspace/wa-cloud-api";

// Base parameter types
const SimpleTextObjectSchema = z.object({ text: z.string() });

const CurrencyObjectSchema = z.object({
  fallback_value: z.string(),
  code: z.nativeEnum(CurrencyCodesEnum),
  amount_1000: z.number(),
});

const DateTimeObjectSchema = z.object({
  fallback_value: z.string(),
});

const MediaObjectSchema = z.object({
  id: z.string().optional(),
  link: z.string().optional(),
  caption: z.string().optional(),
});

// Parameter discriminated unions
const TextParameterSchema = z
  .object({ type: z.literal(ParametersTypesEnum.Text) })
  .merge(SimpleTextObjectSchema);

const CurrencyParameterSchema = z.object({
  type: z.literal(ParametersTypesEnum.Currency),
  currency: CurrencyObjectSchema,
});

const DateTimeParameterSchema = z.object({
  type: z.literal(ParametersTypesEnum.DateTime),
  date_time: DateTimeObjectSchema,
});

const DocumentParameterSchema = z
  .object({ type: z.literal(ParametersTypesEnum.Document) })
  .merge(MediaObjectSchema);

const ImageParameterSchema = z
  .object({ type: z.literal(ParametersTypesEnum.Image) })
  .merge(MediaObjectSchema);

const VideoParameterSchema = z
  .object({ type: z.literal(ParametersTypesEnum.Video) })
  .merge(MediaObjectSchema);

// Button parameters
const QuickReplyButtonSchema = z.object({
  type: z.literal(ParametersTypesEnum.Payload),
  payload: z.string(),
});

const UrlButtonSchema = z
  .object({
    type: z.literal(ParametersTypesEnum.Text),
  })
  .merge(SimpleTextObjectSchema);

const ButtonParameterUnion = z.discriminatedUnion("type", [
  QuickReplyButtonSchema,
  UrlButtonSchema,
]);

// Component types
const ComponentSchema = z.object({
  type: z.nativeEnum(ComponentTypesEnum),
  parameters: z.array(
    z.discriminatedUnion("type", [
      TextParameterSchema,
      CurrencyParameterSchema,
      DateTimeParameterSchema,
      DocumentParameterSchema,
      ImageParameterSchema,
      VideoParameterSchema,
    ])
  ),
});

// Button Component type
const ButtonComponentSchema = z.object({
  type: z.literal(ComponentTypesEnum.Button),
  parameters: ButtonParameterUnion,
  sub_type: z.nativeEnum(SubTypeEnum),
  index: z.nativeEnum(ButtonPositionEnum),
});

// Final schema
export const MessageTemplateSchema = z.object({
  name: z.string(),
  language: z.object({
    policy: z.literal("deterministic"),
    code: z.nativeEnum(LanguagesEnum),
  }),
  components: z
    .array(z.union([ComponentSchema, ButtonComponentSchema]))
    .optional(),
});

export type MessageTemplateValues = z.infer<typeof MessageTemplateSchema>;
