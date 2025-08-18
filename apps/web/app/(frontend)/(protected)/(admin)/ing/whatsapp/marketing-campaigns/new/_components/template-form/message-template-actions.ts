import {
  ComponentValues,
  ParameterValues,
} from "@/features/whatsapp/templates/lib/schema";
import {
  BodyExampleSchema,
  BodyExampleValue,
  HeaderExampleSchema,
  HeaderExampleValue,
  HeaderType,
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

  const isPositional = Object.hasOwn(
    input,
    `${header.success ? "header" : "body"}_text`
  );
  const isNamed = Object.hasOwn(
    input,
    `${header.success ? "header" : "body"}_text_named_params`
  );
  const isMedia = Object.hasOwn(
    input,
    `${header.success ? "header" : "body"}_handle`
  );

  if (isPositional) {
    const temp = header.success
      ? header.data.header_text
      : body.success
        ? (body.data.body_text ?? [])[0]
        : [];

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
    if (type !== "")
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
        parameters: ExtractExampleToParameters(component.example),
      });
    }

    if (component.type === "BODY" && component.example) {
      components.push({
        type: ComponentTypesEnum.Body,
        parameters: ExtractExampleToParameters(component.example),
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
