import {
  ComponentTypesEnum,
  ParametersTypesEnum,
  TemplateBody,
  TemplateHeader,
  TemplateResponse,
} from "@workspace/wa-cloud-api/types";
import { MessageTemplateValues } from "../lib/schema";

export function transformTemplateResponseToFormValues(
  template: TemplateResponse
): MessageTemplateValues {
  const components: MessageTemplateValues["components"] = [];

  template.components.forEach((component) => {
    const format = template.parameter_format;

    if (component.type === "HEADER") {
      const comp = component as TemplateHeader;
      const text = comp.text ?? "";
      const paramKeys = extractTemplateParams(text, format);

      let examples: string[] = [];

      if (format === "POSITIONAL") {
        examples = comp.example?.header_text ?? [];
      } else if (format === "NAMED") {
        examples =
          comp.example?.header_text_named_params?.map((e) => e.example) ?? [];
      }

      const parameters: { type: ParametersTypesEnum.Text; text: string }[] =
        paramKeys.map((_, idx) => ({
          type: ParametersTypesEnum.Text as const,
          text: examples[idx] ?? "",
        }));

      components.push({
        type: ComponentTypesEnum.Header,
        parameters,
      });
    }

    if (component.type === "BODY") {
      const comp = component as TemplateBody;
      const text = comp.text ?? "";
      const paramKeys = extractTemplateParams(text, format);

      let examples: string[] = [];

      if (format === "POSITIONAL") {
        examples = comp.example?.body_text?.[0] ?? [];
      } else if (format === "NAMED") {
        examples =
          comp.example?.body_text_named_params?.map((e) => e.example) ?? [];
      }

      const parameters: { type: ParametersTypesEnum.Text; text: string }[] =
        paramKeys.map((_, idx) => ({
          type: ParametersTypesEnum.Text as const,
          text: examples[idx] ?? "",
        }));

      components.push({
        type: ComponentTypesEnum.Body,
        parameters,
      });
    }
  });

  return {
    name: template.name,
    language: {
      policy: "deterministic",
      code: template.language,
    },
    components,
  };
}

export function extractTemplateParams(
  text: string,
  format: "POSITIONAL" | "NAMED"
) {
  if (format === "POSITIONAL") {
    const matches = [...text.matchAll(/{{(\d+)}}/g)];
    return Array.from(new Set(matches.map((m) => m[1]))).map((n) => `{{${n}}}`);
  }

  if (format === "NAMED") {
    const matches = [...text.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g)];
    return Array.from(new Set(matches.map((m) => m[1])));
  }

  return [];
}
