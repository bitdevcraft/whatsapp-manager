import { z } from "zod";

import {
  ComponentTypesEnum,
  ParametersTypesEnum,
  SubTypeEnum,
  ButtonPositionEnum,
  LanguagesEnum,
  CurrencyCodesEnum,
} from "@workspace/wa-cloud-api";

// Language Object Schema
export const LanguageObjectSchema = z.object({
  policy: z.literal("deterministic"),
  code: z.nativeEnum(LanguagesEnum),
});

// Parameter Schemas
const TextParametersObjectSchema = z.object({
  type: z.literal(ParametersTypesEnum.Text),
  text: z.string(),
  parameter_name: z.string().optional(),
});

const CouponCodeParametersObjectSchema = z.object({
  type: z.literal(ParametersTypesEnum.CouponCode),
  coupon_code: z.string(),
});

const CurrencyParametersObjectSchema = z.object({
  type: z.literal(ParametersTypesEnum.Currency),
  currency: z.object({
    fallback_value: z.string(),
    code: z.nativeEnum(CurrencyCodesEnum),
    amount_1000: z.number(),
  }),
});

const DateTimeParametersObjectSchema = z.object({
  type: z.literal(ParametersTypesEnum.DateTime),
  date_time: z.object({ fallback_value: z.string() }),
});

const DocumentParametersObjectSchema = z.object({
  type: z.literal(ParametersTypesEnum.Document),
  id: z.string().optional(),
  document: z.object({
    id: z.string().optional(),
    link: z.string().optional(),
    caption: z.string().optional(),
    filename: z.string().optional(),
  }),
});

const ImageParametersObjectSchema = z.object({
  type: z.literal(ParametersTypesEnum.Image),
  image: z.object({
    id: z.string().optional(),
    link: z.string().optional(),
    caption: z.string().optional(),
  }),
});

const VideoParametersObjectSchema = z.object({
  type: z.literal(ParametersTypesEnum.Video),
  video: z.object({
    id: z.string().optional(),
    link: z.string().optional(),
    caption: z.string().optional(),
  }),
});

// Union of all parameter schemas
export const ParameterSchema = z.union([
  TextParametersObjectSchema,
  CouponCodeParametersObjectSchema,
  CurrencyParametersObjectSchema,
  DateTimeParametersObjectSchema,
  DocumentParametersObjectSchema,
  ImageParametersObjectSchema,
  VideoParametersObjectSchema,
]);


// Component Schemas for Header, Body, Footer
const HeaderComponentSchema = z.object({
  type: z.literal(ComponentTypesEnum.Header),
  parameters: z.array(ParameterSchema),
});

const BodyComponentSchema = z.object({
  type: z.literal(ComponentTypesEnum.Body),
  parameters: z.array(ParameterSchema),
});

const FooterComponentSchema = z.object({
  type: z.literal(ComponentTypesEnum.Footer),
  parameters: z.array(ParameterSchema),
});

// Button Component Schema
const ButtonComponentSchema = z.object({
  type: z.literal(ComponentTypesEnum.Button),
  parameters: z.array(z.nativeEnum(ParametersTypesEnum)),
  sub_type: z.nativeEnum(SubTypeEnum),
  index: z.nativeEnum(ButtonPositionEnum),
});

// Union of component schemas, discriminated by 'type'
export const ComponentSchema = z.discriminatedUnion("type", [
  HeaderComponentSchema,
  BodyComponentSchema,
  FooterComponentSchema,
  ButtonComponentSchema,
]);

// Main MessageTemplateObject Schema
export const MessageTemplateSchema = z.object({
  name: z.string(),
  language: LanguageObjectSchema,
  components: z.array(ComponentSchema).optional(),
});

// Type inference
export type MessageTemplateValues = z.infer<typeof MessageTemplateSchema>;
export type ComponentValues = z.infer<typeof ComponentSchema>;
export type ParameterValues = z.infer<typeof ParameterSchema>;
