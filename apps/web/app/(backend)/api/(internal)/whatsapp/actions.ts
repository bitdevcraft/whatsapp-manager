import { baseConversation, ConversationBody } from "@workspace/db";
import { Template } from "@workspace/db/schema";
import {
  ComponentTypesEnum,
  MessageTemplateObject,
  ParametersTypesEnum,
} from "@workspace/wa-cloud-api";

export function generateConversationComponentBody(
  messageTemplate: MessageTemplateObject<ComponentTypesEnum>,
  template?: Template
) {
  const conversationBody: ConversationBody = {};

  if (template?.content) {
    const { components } = template.content;

    components.forEach((component) => {
      switch (component.type) {
        case "BODY":
          conversationBody.body = {
            text: component.text,
          };
          break;
        case "BUTTONS":
          conversationBody.buttons = component.buttons.map((button) => {
            switch (button.type) {
              case "FLOW":
              case "PHONE_NUMBER":
              case "QUICK_REPLY":
              case "URL":
                return {
                  text: button.text,
                  type: button.type,
                };

              default:
                return {
                  type: button.type,
                };
            }
          });
          break;
        case "CAROUSEL":
          component.cards;
          break;
        case "FOOTER":
          conversationBody.footer = component.text;
          break;

        case "HEADER":
          conversationBody.header = {
            text: component.text,
          };
          break;

        default:
          break;
      }
    });
  }

  const { components } =
    messageTemplate as MessageTemplateObject<ComponentTypesEnum>;

  components?.forEach((component) => {
    const { type } = component;

    if (type === ComponentTypesEnum.Header) {
      const baseConversation: baseConversation = {};
      const parameterName: Record<string, string> = {};
      const indexName: string[] = [];
      component.parameters.forEach((parameter) => {
        switch (parameter.type) {
          case ParametersTypesEnum.Document:
          case ParametersTypesEnum.Image:
          case ParametersTypesEnum.Video:
            baseConversation.media = {
              caption: parameter.caption,
              id: parameter.id,
              url: parameter.link,
            };

            break;
          case ParametersTypesEnum.Text:
            if (parameter.parameter_name)
              parameterName[parameter.parameter_name] = parameter.text;
            else indexName.push(parameter.text);
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
      component.parameters.forEach((parameter) => {
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
