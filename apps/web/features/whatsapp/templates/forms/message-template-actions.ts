import {
  ParametersTypesEnum,
  ComponentTypesEnum,
} from "@workspace/wa-cloud-api";

import {
  TemplateBody,
  TemplateHeader,
  TemplateResponse,
} from "@workspace/wa-cloud-api/template";
import { MessageTemplateValues } from "../lib/schema";

export function transformTemplateResponseToFormValues(
  template: TemplateResponse,
): MessageTemplateValues {
  const components: MessageTemplateValues["components"] = [];

  template.components.forEach((component) => {
    const format = template.parameter_format;

    if (component.type === "HEADER") {
      const comp = component as TemplateHeader;
      const text = comp.text ?? "";
      const paramKeys = extractTemplateParams(text, format);
      const example =
        format === "POSITIONAL"
          ? (comp.example?.header_text ?? [])
          : (comp.example?.header_text_named_params?.map((e) => e.example) ??
            []);

      const parameters = paramKeys
        .map((parameter_name, idx) => {
          if (comp.format === "TEXT" && format === "POSITIONAL") {
            return {
              type: ParametersTypesEnum.Text as const,
              text: example[idx] ?? "",
            };
          }

          if (comp.format === "TEXT" && format === "NAMED") {
            return {
              type: ParametersTypesEnum.Text as const,
              text: example[idx] ?? "",
              parameter_name,
            };
          }

          if (comp.format === "IMAGE") {
            return {
              type: ParametersTypesEnum.Image as const,
              id: "",
            };
          }

          if (comp.format === "VIDEO") {
            return {
              type: ParametersTypesEnum.Video as const,
              id: "",
            };
          }

          if (comp.format === "DOCUMENT") {
            return {
              type: ParametersTypesEnum.Document as const,
              id: "",
            };
          }

          return null;
        })
        .filter((t) => t !== null);

      if (parameters.length > 0)
        components.push({
          type: ComponentTypesEnum.Header,
          parameters,
        });
    }

    if (component.type === "BODY") {
      const comp = component as TemplateBody;
      const text = comp.text ?? "";
      const paramKeys = extractTemplateParams(text, format);
      const example =
        format === "POSITIONAL"
          ? (comp.example?.body_text?.[0] ?? [])
          : (comp.example?.body_text_named_params?.map((e) => e.example) ?? []);

      const parameters =
        format === "POSITIONAL"
          ? paramKeys.map((_, idx) => ({
              type: ParametersTypesEnum.Text as const,
              text: example[idx] ?? "",
            }))
          : paramKeys.map((parameter_name, idx) => ({
              type: ParametersTypesEnum.Text as const,
              text: example[idx] ?? "",
              parameter_name,
            }));

      if (parameters.length > 0)
        components.push({
          type: ComponentTypesEnum.Body,
          parameters,
        });
    }
  });

  console.log(JSON.stringify(components));

  return {
    name: template.name,
    language: {
      policy: "deterministic",
      code: template.language,
    },
    components,
  };
}

// export function extractTemplateParams(
//   text: string,
//   format: "POSITIONAL" | "NAMED"
// ) {
//   if (format === "POSITIONAL") {
//     const matches = [...text.matchAll(/{{(\d+)}}/g)];
//     return Array.from(new Set(matches.map((m) => m[1]))).map((n) => `{{${n}}}`);
//   }

//   if (format === "NAMED") {
//     const matches = [...text.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g)];
//     return Array.from(new Set(matches.map((m) => m[1])));
//   }

//   return [];
// }

export function extractTemplateParams(
  text: string,
  format: "POSITIONAL" | "NAMED",
) {
  if (format === "POSITIONAL") {
    const matches = [...text.matchAll(/{{(\d+)}}/g)];
    return Array.from(new Set(matches.map((m) => m[0])));
  }

  if (format === "NAMED") {
    const matches = [...text.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g)];
    console.log(matches);
    return Array.from(new Set(matches.map((m) => m[1])));
  }

  return [];
}
