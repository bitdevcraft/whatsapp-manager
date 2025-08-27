import { LanguagesEnum } from "@workspace/wa-cloud-api";
// schema.ts (or your ../_lib/validation)
import { z } from "zod";

/* Enums */
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

export const HeaderType = z.union([
  z.literal("TEXT"),
  z.literal("IMAGE"),
  z.literal("VIDEO"),
  z.literal("DOCUMENT"),
  z.literal("PRODUCT"),
]);
export const ParameterFormatType = z.union([
  z.literal("POSITIONAL"),
  z.literal("NAMED"),
]);

export const HeaderExampleSchema = z.object({
  header_handle: z.array(z.string()).optional(),
  header_text: z.array(z.string()).optional(),
  header_text_named_params: z
    .array(
      z.object({
        example: z.string(),
        param_name: z.string(),
      })
    )
    .optional(),
});

export type HeaderExampleValue = z.infer<typeof HeaderExampleSchema>;

export const BodyExampleSchema = z.object({
  body_text: z.array(z.array(z.string())).optional(),
  body_text_named_params: z
    .array(
      z.object({
        example: z.string(),
        param_name: z.string(),
      })
    )
    .optional(),
});

export type BodyExampleValue = z.infer<typeof BodyExampleSchema>;

/* Components */
export const HeaderComponentSchema = z.object({
  example: HeaderExampleSchema.optional(),
  format: HeaderType,
  text: z.string().optional(),
  type: z.literal("HEADER"),
});

export const BodyComponentSchema = z.object({
  example: BodyExampleSchema.optional(),
  text: z.string(),
  type: z.literal("BODY"),
});

export const FooterComponentSchema = z.object({
  text: z.string(),
  type: z.literal("FOOTER"),
});

/* Button + per-type constraints */
export const ButtonSchema = z
  .object({
    phone_number: z.string().optional(),
    text: z.string().min(3, "Button Label Missing"),
    type: ButtonType,
    url: z.string().url().optional(),
  })
  .superRefine((btn, ctx) => {
    if (btn.type === "URL") {
      if (!btn.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL is required for URL buttons.",
          path: ["url"],
        });
      }
      if (btn.phone_number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "phone_number must be empty for URL buttons.",
          path: ["phone_number"],
        });
      }
    }
    if (btn.type === "PHONE_NUMBER") {
      if (!btn.phone_number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "phone_number is required for PHONE_NUMBER buttons.",
          path: ["phone_number"],
        });
      }
      if (btn.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "url must be empty for PHONE_NUMBER buttons.",
          path: ["url"],
        });
      }
    }
    if (btn.type === "QUICK_REPLY") {
      if (btn.url || btn.phone_number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "url/phone_number must be empty for QUICK_REPLY buttons.",
        });
      }
    }
  });

export const ButtonComponentSchema = z.object({
  buttons: z
    .array(ButtonSchema)
    .min(1, "At least 1 button")
    .max(2, "At most 2 buttons"),
  type: z.literal("BUTTONS"),
});

export const BaseCreateSchema = z.object({
  category: CategoryType,
  language: z.nativeEnum(LanguagesEnum),
  name: z
    .string()
    .min(1, "Required")
    .max(512)
    .regex(/^[a-z0-9_]+$/, "snake_case, lowercase only"),
  parameter_format: ParameterFormatType,
});

export type BaseCreateValue = z.infer<typeof BaseCreateSchema>;

/* Normal template (kept for completeness) */
export const ComponentSchema = z.array(
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
  format: "TEXT",
  text: "",
  type: "HEADER",
};
const bodyValue: z.infer<typeof BodyComponentSchema> = {
  text: "",
  type: "BODY",
};

const footerValue: z.infer<typeof FooterComponentSchema> = {
  text: "",
  type: "FOOTER",
};

export const defaultValue: TemplateCreateValue = {
  category: "MARKETING",
  components: [headerValue, bodyValue, footerValue],
  language: LanguagesEnum.English,
  name: "",
  parameter_format: "POSITIONAL",
};

/* -----------------------------
   Carousel Template (STRICT)
------------------------------*/

const CarouselCardSchema = z
  .object({
    components: z.array(
      z.union([HeaderComponentSchema, ButtonComponentSchema])
    ),
  })
  .superRefine((card, ctx) => {
    const headers = card.components.filter((c) => c.type === "HEADER");
    const buttons = card.components.filter((c) => c.type === "BUTTONS");

    if (headers.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each card must have exactly one HEADER component.",
        path: ["components"],
      });
    }
    if (buttons.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each card must have exactly one BUTTONS component.",
        path: ["components"],
      });
    }
    // buttons count range is already enforced in ButtonComponentSchema
  });

const CarouselComponentSchema = z
  .object({
    cards: z.array(CarouselCardSchema).min(1),
    type: z.literal("CAROUSEL"),
  })
  .superRefine((carousel, ctx) => {
    if (!carousel.cards.length) return;

    // Reference card = the first card
    const first = carousel.cards[0];

    if (!first) return;

    // Extract header.format and button type signature from the first card
    const getHeaderFormat = (card: z.infer<typeof CarouselCardSchema>) =>
      (
        card.components.find((c) => c.type === "HEADER") as z.infer<
          typeof HeaderComponentSchema
        >
      ).format;

    const getButtonsSignature = (card: z.infer<typeof CarouselCardSchema>) => {
      const btnComp = card.components.find(
        (c) => c.type === "BUTTONS"
      ) as z.infer<typeof ButtonComponentSchema>;
      const types = btnComp.buttons.map((b) => b.type);
      return { count: types.length, types };
    };

    const refHeaderFormat = getHeaderFormat(first);
    const refSig = getButtonsSignature(first);

    carousel.cards.forEach((card, idx) => {
      const hdrFmt = getHeaderFormat(card);
      const sig = getButtonsSignature(card);

      if (hdrFmt !== refHeaderFormat) {
        // point error to the header.format path
        const headerIndex = card.components.findIndex(
          (c) => c.type === "HEADER"
        );
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Header format must match all cards (${refHeaderFormat}).`,
          path: ["cards", idx, "components", headerIndex, "format"],
        });
      }

      if (sig.count !== refSig.count) {
        const btnIndex = card.components.findIndex((c) => c.type === "BUTTONS");
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Each card must have exactly ${refSig.count} button(s) to match the first card.`,
          path: ["cards", idx, "components", btnIndex, "buttons"],
        });
      } else {
        // Ensure button TYPES (and order) match the first card
        for (let i = 0; i < sig.types.length; i++) {
          if (sig.types[i] !== refSig.types[i]) {
            const btnIndex = card.components.findIndex(
              (c) => c.type === "BUTTONS"
            );
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Button type at index ${i} must be "${refSig.types[i]}", found "${sig.types[i]}".`,
              path: [
                "cards",
                idx,
                "components",
                btnIndex,
                "buttons",
                i,
                "type",
              ],
            });
          }
        }
      }
    });
  });

export const TemplateCarouselCreateSchema = BaseCreateSchema.extend({
  // exactly one BODY and one CAROUSEL (in any order)
  components: z
    .array(z.union([BodyComponentSchema, CarouselComponentSchema]))
    .superRefine((comps, ctx) => {
      const bodyCount = comps.filter((c) => c.type === "BODY").length;
      const carouselCount = comps.filter((c) => c.type === "CAROUSEL").length;
      if (bodyCount !== 1 || carouselCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "components must contain exactly one BODY and one CAROUSEL.",
        });
      }
    }),
});

export type TemplateCarouselCreateValue = z.infer<
  typeof TemplateCarouselCreateSchema
>;

/* Useful default */
export const templateCarouselDefault: TemplateCarouselCreateValue = {
  category: "MARKETING",
  components: [
    { text: "", type: "BODY" },
    {
      cards: [
        {
          components: [
            {
              example: {
                header_handle: [""],
              },
              format: "IMAGE",
              type: "HEADER",
            },
            {
              buttons: [{ text: "Quick Reply", type: "QUICK_REPLY" }],
              type: "BUTTONS",
            },
          ],
        },
      ],
      type: "CAROUSEL",
    },
  ],
  language: LanguagesEnum.English,
  name: "",
  parameter_format: "POSITIONAL",
};
