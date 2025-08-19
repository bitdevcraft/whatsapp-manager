import { ConversationBody, baseConversation } from "@workspace/db";
import { Template } from "@workspace/db/schema";
import {
  MessageTemplateObject,
  ComponentTypesEnum,
  ParametersTypesEnum,
} from "@workspace/wa-cloud-api";
import template from "@workspace/wa-cloud-api/template";

export function generateConversationComponentBody(
  messageTemplate: MessageTemplateObject<ComponentTypesEnum>,
  template?: Template
) {
  const conversationBody: ConversationBody = {};

  if (template?.content) {
    const { components } = template.content;

    components.forEach((component) => {
      switch (component.type) {
        case "HEADER":
          conversationBody.header = {
            text: component.text,
          };
          break;
        case "BODY":
          conversationBody.body = {
            text: component.text,
          };
          break;
        case "FOOTER":
          conversationBody.footer = component.text;
          break;
        case "BUTTONS":
          conversationBody.buttons = component.buttons.map((button) => {
            switch (button.type) {
              case "PHONE_NUMBER":
              case "URL":
              case "QUICK_REPLY":
              case "FLOW":
                return {
                  type: button.type,
                  text: button.text,
                };

              default:
                return {
                  type: button.type,
                };
            }
          });
          break;

        default:
          break;
      }
    });
  }

  const { components } =
    messageTemplate as MessageTemplateObject<ComponentTypesEnum>;

  components?.forEach((component) => {
    const { type, parameters } = component;

    if (type === ComponentTypesEnum.Header) {
      const baseConversation: baseConversation = {};
      const parameterName: Record<string, string> = {};
      const indexName: string[] = [];
      parameters.forEach((parameter) => {
        switch (parameter.type) {
          case ParametersTypesEnum.Text:
            if (parameter.parameter_name)
              parameterName[parameter.parameter_name] = parameter.text;
            else indexName.push(parameter.text);
            break;
          case ParametersTypesEnum.Image:
          case ParametersTypesEnum.Document:
          case ParametersTypesEnum.Video:
            baseConversation.media = {
              url: parameter.link,
              id: parameter.id,
              caption: parameter.caption,
            };

            break;
          default:
            break;
        }
      });

      conversationBody.header!.media = baseConversation.media;

      if (
        Object.keys(parameterName).length > 0 &&
        conversationBody.header?.text
      ) {
        conversationBody.header.text = interpolate(
          conversationBody.header.text,
          parameterName
        );
      }
      if (indexName.length > 0 && conversationBody.header?.text) {
        conversationBody.header.text = interpolate(
          conversationBody.header.text,
          indexName
        );
      }
    }

    if (type === ComponentTypesEnum.Body) {
      const parameterName: Record<string, string> = {};
      const indexName: string[] = [];
      parameters.forEach((parameter) => {
        switch (parameter.type) {
          case ParametersTypesEnum.Text:
            if (parameter.parameter_name)
              parameterName[parameter.parameter_name] = parameter.text;
            else indexName.push(parameter.text);
            break;

            break;
          default:
            break;
        }
      });

      if (
        Object.keys(parameterName).length > 0 &&
        conversationBody.body?.text
      ) {
        conversationBody.body.text = interpolate(
          conversationBody.body.text,
          parameterName
        );
      }
      if (indexName.length > 0 && conversationBody.body?.text) {
        conversationBody.body.text = interpolate(
          conversationBody.body.text,
          indexName
        );
      }
    }
  });

  return conversationBody;
}

export function interpolate(
  template: string,
  record: Record<string, unknown> | unknown[]
): string {
  return template.replace(/{{\s*([^{}]+)\s*}}/g, (_match, rawToken) => {
    const token = String(rawToken).trim();

    if (Array.isArray(record) && /^\d+$/.test(token)) {
      // 1-based index in the placeholder → 0-based index in the array
      const value = record[Number(token) - 1];
      return value != null ? String(value) : "";
    }

    if (!Array.isArray(record) && token in record) {
      const value = (record as Record<string, unknown>)[token];
      return value != null ? String(value) : "";
    }

    // Unresolved tokens default to an empty string
    return "";
  });
}
