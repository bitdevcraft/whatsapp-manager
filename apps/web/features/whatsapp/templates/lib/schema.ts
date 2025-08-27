import {
  ButtonPositionEnum,
  ComponentTypesEnum,
  CurrencyCodesEnum,
  LanguagesEnum,
  ParametersTypesEnum,
  SubTypeEnum,
} from "@workspace/wa-cloud-api";
import { z } from "zod";

// Language Object Schema
export const LanguageObjectSchema = z.object({
  code: z.nativeEnum(LanguagesEnum),
  policy: z.literal("deterministic"),
});

// Parameter Schemas
const TextParametersObjectSchema = z.object({
  parameter_name: z.string().optional(),
  text: z.string(),
  type: z.literal(ParametersTypesEnum.Text),
});

const CouponCodeParametersObjectSchema = z.object({
  coupon_code: z.string(),
  type: z.literal(ParametersTypesEnum.CouponCode),
});

const CurrencyParametersObjectSchema = z.object({
  currency: z.object({
    amount_1000: z.number(),
    code: z.nativeEnum(CurrencyCodesEnum),
    fallback_value: z.string(),
  }),
  type: z.literal(ParametersTypesEnum.Currency),
});

const DateTimeParametersObjectSchema = z.object({
  date_time: z.object({ fallback_value: z.string() }),
  type: z.literal(ParametersTypesEnum.DateTime),
});

const MediaObjectSchema = z.object({
  id: z.string().min(1, "Please Upload"),
  link: z.string().optional(),
});

const DocumentParametersObjectSchema = z.object({
  document: MediaObjectSchema.extend({
    caption: z.string().optional(),
    filename: z.string().optional(),
  }),
  id: z.string().optional(),
  type: z.literal(ParametersTypesEnum.Document),
});

const ImageParametersObjectSchema = z.object({
  image: MediaObjectSchema.extend({
    caption: z.string().optional(),
  }),
  type: z.literal(ParametersTypesEnum.Image),
});

const VideoParametersObjectSchema = z.object({
  type: z.literal(ParametersTypesEnum.Video),
  video: MediaObjectSchema.extend({
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
  parameters: z.array(ParameterSchema),
  type: z.literal(ComponentTypesEnum.Header),
});

const BodyComponentSchema = z.object({
  parameters: z.array(ParameterSchema),
  type: z.literal(ComponentTypesEnum.Body),
});

const FooterComponentSchema = z.object({
  parameters: z.array(ParameterSchema),
  type: z.literal(ComponentTypesEnum.Footer),
});

// Button Component Schema
const ButtonComponentSchema = z.object({
  index: z.nativeEnum(ButtonPositionEnum),
  parameters: z.array(z.nativeEnum(ParametersTypesEnum)),
  sub_type: z.nativeEnum(SubTypeEnum),
  type: z.literal(ComponentTypesEnum.Button),
});

export const CardsComponentsSchema = z.discriminatedUnion("type", [
  HeaderComponentSchema,
  BodyComponentSchema,
  ButtonComponentSchema,
]);

export const CardSchema = z.object({
  card_index: z.number(),
  components: z.array(CardsComponentsSchema),
});

const CarouselComponentSchema = z.object({
  cards: z.array(CardSchema),
  type: z.literal(ComponentTypesEnum.Carousel),
});

// Union of component schemas, discriminated by 'type'
export const ComponentSchema = z.discriminatedUnion("type", [
  HeaderComponentSchema,
  BodyComponentSchema,
  FooterComponentSchema,
  ButtonComponentSchema,
  CarouselComponentSchema,
]);

// Main MessageTemplateObject Schema
export const MessageTemplateSchema = z.object({
  components: z.array(ComponentSchema).optional(),
  language: LanguageObjectSchema,
  name: z.string(),
});

export type ComponentValues = z.infer<typeof ComponentSchema>;
// Type inference
export type MessageTemplateValues = z.infer<typeof MessageTemplateSchema>;
export type ParameterValues = z.infer<typeof ParameterSchema>;
