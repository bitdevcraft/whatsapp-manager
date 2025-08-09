import { CategoryEnum, LanguagesEnum } from "@workspace/wa-cloud-api";
import { z } from "zod";

export const ButtonSchema = z.object({
  type: z.enum(["URL", "PHONE_NUMBER", "QUICK_REPLY"] as const),
  text: z.string(),
  url: z.string().optional(),
  phone_number: z.string().optional(),
});

export const SimpleTemplateSchema = z.object({
  name: z.string().min(3, { message: "Must be 3 or more characters long" }),
  category: z.nativeEnum(CategoryEnum),
  language: z.object({
    policy: z.string(),
    code: z.nativeEnum(LanguagesEnum),
  }),
  body: z.string().min(5),
  buttons: z.array(ButtonSchema),
});

export type SimpleTemplateValues = z.infer<typeof SimpleTemplateSchema>;

const ButtonType = z.union([
  z.literal("QUICK_REPLY"),
  z.literal("URL"),
  z.literal("PHONE_NUMBER"),
]);

const CategoryType = z.union([
  z.literal("MARKETING"),
  z.literal("UTILITY"),
  z.literal("AUTHENTICATION"),
]);

const HeaderType = z.union([z.literal("TEXT"), z.literal("IMAGE")]);
const ParameterFormatType = z.union([
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

const ButtonComponentSchema = z.object({
  type: z.literal("BUTTONS"),
  buttons: z.array(
    z.object({
      type: ButtonType,
      text: z.string(),
      url: z.string().optional(),
      phone_number: z.string().optional(),
    })
  ),
});

const ComponentSchema = z.array(
  z.union([
    HeaderComponentSchema,
    BodyComponentSchema,
    FooterComponentSchema,
    ButtonComponentSchema,
  ])
);

export const TemplateCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Required")
    .max(512)
    .regex(/^[a-z0-9_]+$/, "snake_case, lowercase only"),
  category: CategoryType,
  parameter_format: ParameterFormatType,
  components: ComponentSchema,
  language: z.nativeEnum(LanguagesEnum),
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
