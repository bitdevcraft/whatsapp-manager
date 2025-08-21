import {
  CardSchema,
  CardsComponentsSchema,
  ComponentValues,
  ParameterValues,
} from "@/features/whatsapp/templates/lib/schema";
import {
  BodyExampleSchema,
  BodyExampleValue,
  HeaderExampleSchema,
  HeaderExampleValue,
} from "@/types/validations/templates/template-schema";
import {
  ComponentTypesEnum,
  ParametersTypesEnum,
  TemplateResponse,
} from "@workspace/wa-cloud-api";
import z from "zod";

export function ExtractExampleToParameters(
  input: BodyExampleValue | HeaderExampleValue,
  format?: string
) {
  const header = HeaderExampleSchema.safeParse(input);
  const body = BodyExampleSchema.safeParse(input);
  const parameters: ParameterValues[] = [];

  if (!header.success && !body.success) return parameters;

  const isPositional =
    Object.hasOwn(input, `header_text`) || Object.hasOwn(input, `body_text`);
  const isNamed =
    Object.hasOwn(input, `header_text_named_params`) ||
    Object.hasOwn(input, `body_text_named_params`);
  const isMedia = Object.hasOwn(input, `header_handle`);

  if (isPositional) {
    let temp: string[] = [];

    if (header.success && header.data.header_text) {
      temp = header.data.header_text;
    }

    if (body.success && body.data.body_text && body.data.body_text[0]) {
      temp = body.data.body_text[0];
    }

    temp?.forEach((text) => {
      parameters.push({
        type: ParametersTypesEnum.Text,
        text,
      });
    });
  }

  if (isNamed) {
    const temp = header.success
      ? header.data.header_text_named_params
      : body.success
        ? body.data.body_text_named_params
        : [];

    temp?.forEach((named) => {
      parameters.push({
        type: ParametersTypesEnum.Text,
        text: named.example,
        parameter_name: named.param_name,
      });
    });
  }

  if (isMedia && format) {
    const temp = header.success ? header.data.header_handle : [];

    const type =
      format === ParametersTypesEnum.Image
        ? (ParametersTypesEnum.Image as const)
        : format === ParametersTypesEnum.Video
          ? (ParametersTypesEnum.Video as const)
          : format === ParametersTypesEnum.Document
            ? (ParametersTypesEnum.Document as const)
            : "";
    if (type !== "") {
      temp?.forEach(() => {
        // @ts-expect-error type
        parameters.push({
          type,
          [type.toLocaleLowerCase()]: {
            id: "",
          },
        });
      });
    }
  }

  return parameters;
}

export function TranslateTemplateResponseToMessageTemplate(
  input: TemplateResponse
) {
  const components: ComponentValues[] = [];

  input.components.forEach((component) => {
    if (component.type === "HEADER" && component.example) {
      components.push({
        type: ComponentTypesEnum.Header,
        parameters: ExtractExampleToParameters(
          component.example,
          component.format
        ),
      });
    }

    if (component.type === "BODY" && component.example) {
      components.push({
        type: ComponentTypesEnum.Body,
        parameters: ExtractExampleToParameters(component.example),
      });
    }

    if (component.type === "CAROUSEL") {
      const cards: z.infer<typeof CardSchema>[] = [];

      component.cards.forEach((card, i) => {
        const cardComponents: z.infer<typeof CardsComponentsSchema>[] = [];

        card.components.forEach((cardComp) => {
          if (cardComp.type === "HEADER" && cardComp.example) {
            cardComponents.push({
              type: ComponentTypesEnum.Header,
              parameters: ExtractExampleToParameters(
                cardComp.example,
                cardComp.format
              ),
            });
          }

          if (cardComp.type === "BODY" && cardComp.example) {
            cardComponents.push({
              type: ComponentTypesEnum.Body,
              parameters: ExtractExampleToParameters(cardComp.example),
            });
          }
        });

        cards.push({
          card_index: i,
          components: cardComponents,
        });
      });

      components.push({
        type: ComponentTypesEnum.Carousel,
        cards,
      });
    }
  });

  return {
    name: input.name,
    language: {
      policy: "deterministic",
      code: input.language,
    },
    components,
  };
}
