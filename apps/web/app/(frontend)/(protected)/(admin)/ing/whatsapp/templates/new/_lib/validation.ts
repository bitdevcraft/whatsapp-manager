import { LanguagesEnum } from "@workspace/wa-cloud-api";
import { z } from "zod";

export const ButtonType = z.union([
  z.literal("QUICK_REPLY"),
  z.literal("URL"),
  z.literal("PHONE_NUMBER"),
]);

export const CategoryType = z.union([
  z.literal("MARKETING"),
  z.literal("UTILITY"),
  z.literal("AUTHENTICATION"),
]);

const HeaderType = z.union([z.literal("TEXT"), z.literal("IMAGE")]);

export const ParameterFormatType = z.union([
  z.literal("POSITIONAL"),
  z.literal("NAMED"),
]);

const HeaderComponentSchema = z.object({
  type: z.literal("HEADER"),
  format: HeaderType,
  text: z.string().optional(),
  example: z
    .object({
      header_text: z.array(z.string()).optional(),
      header_text_named_params: z
        .array(
          z.object({
            param_name: z.string(),
            example: z.string(),
          })
        )
        .optional(),
      header_handle: z.array(z.string()).optional(),
    })
    .optional(),
});

const BodyComponentSchema = z.object({
  type: z.literal("BODY"),
  text: z.string(),
  example: z
    .object({
      body_text: z.array(z.array(z.string())).optional(),
      body_text_named_params: z
        .array(
          z.object({
            param_name: z.string(),
            example: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});

const FooterComponentSchema = z.object({
  type: z.literal("FOOTER"),
  text: z.string(),
});

const ButtonSchema = z.object({
  type: ButtonType,
  text: z.string().min(3),
  url: z.string().url().optional(),
  phone_number: z.string().optional(),
});

const ButtonComponentSchema = z.object({
  type: z.literal("BUTTONS"),
  buttons: z.array(ButtonSchema),
});

const BaseCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Required")
    .max(512)
    .regex(/^[a-z0-9_]+$/, "snake_case, lowercase only"),
  category: CategoryType,
  parameter_format: ParameterFormatType,
  language: z.nativeEnum(LanguagesEnum),
});

/**
 * Normal Template
 */

const ComponentSchema = z.array(
  z.union([
    HeaderComponentSchema,
    BodyComponentSchema,
    FooterComponentSchema,
    ButtonComponentSchema,
  ])
);

export const TemplateCreateSchema = BaseCreateSchema.extend({
  components: ComponentSchema,
});

export type TemplateCreateValue = z.infer<typeof TemplateCreateSchema>;

const headerValue: z.infer<typeof HeaderComponentSchema> = {
  type: "HEADER",
  format: "TEXT",
  text: "",
};
const bodyValue: z.infer<typeof BodyComponentSchema> = {
  type: "BODY",
  text: "",
};

const footerValue: z.infer<typeof FooterComponentSchema> = {
  type: "FOOTER",
  text: "",
};

export const defaultValue: TemplateCreateValue = {
  name: "",
  category: "MARKETING",
  components: [headerValue, bodyValue, footerValue],
  parameter_format: "POSITIONAL",
  language: LanguagesEnum.English,
};

/**
 * Carousel Template
 */

const CarouselCardSchema = z.object({
  components: z.array(z.union([HeaderComponentSchema, ButtonComponentSchema])),
});

const CarouselComponentSchema = z.object({
  type: z.literal("CAROUSEL"),
  cards: z.array(CarouselCardSchema),
});

export const TemplateCarouselCreateSchema = BaseCreateSchema.extend({
  components: z.array(z.union([BodyComponentSchema, CarouselComponentSchema])),
});

export type TemplateCarouselCreateValue = z.infer<
  typeof TemplateCarouselCreateSchema
>;

export const templateCarouselDefault: TemplateCarouselCreateValue = {
  name: "",
  category: "MARKETING",
  parameter_format: "POSITIONAL",
  language: LanguagesEnum.English,
  components: [
    { type: "BODY", text: "" },
    {
      type: "CAROUSEL",
      cards: [
        {
          components: [
            {
              type: "HEADER",
              format: "IMAGE",
              example: {
                header_handle: [""],
              },
            },
            { type: "BUTTONS", buttons: [] },
          ],
        },
      ],
    },
  ],
};
