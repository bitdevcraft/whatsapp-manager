/* eslint-disable perfectionist/sort-objects */
import WhatsApp, {
  ComponentTypesEnum,
  InteractiveTypesEnum,
  LanguagesEnum,
  ParametersTypesEnum,
  WebhookMessage,
} from "@workspace/wa-cloud-api";

type CmdMessageHandlerMap = Record<
  string,
  (client: WhatsApp, message: WebhookMessage) => Promise<void>
>;

export const cmdMessageHandler: CmdMessageHandlerMap = {
  "\\hello": cmdHelloMessage,
  "\\help": cmdHelpMessage,
  "\\hi": cmdHelloMessage,
  "\\info": cmdInfoMessage,
  "\\interactive": cmdInteractiveMessage,
  "\\template": cmdTemplateMessage,
};

export async function cmdHelloMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  await client.messages.text({
    body: `Hello! How can I help you today?`,
    to: message.from,
  });
}

export async function cmdHelpMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  await client.messages.text({
    body: `Available commands:
- \\hello/\\hi: Get a greeting
- \\help: Show this help message
- \\info: Get account information
- \\template: See a template example
- \\interactive: See interactive message example`,
    to: message.from,
  });
}

export async function cmdInfoMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  await client.messages.text({
    body: `Your WhatsApp number: ${message.from}
Profile name: ${message.profileName}
Our phone: ${message.displayPhoneNumber}`,
    to: message.from,
  });
}

export async function cmdInteractiveMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  await client.messages.interactive({
    to: message.from,
    body: {
      type: InteractiveTypesEnum.Button,
      body: {
        text: "What would you like to do?",
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "help_button",
              title: "Get Help",
            },
          },
          {
            type: "reply",
            reply: {
              id: "info_button",
              title: "Account Info",
            },
          },
        ],
      },
    },
  });
}

export async function cmdTemplateMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  try {
    await client.messages.template({
      body: {
        name: "smaple_template", // Replace with your approved template name
        language: {
          code: LanguagesEnum.English_US,
          policy: "deterministic",
        },
        components: [
          {
            type: ComponentTypesEnum.Body,
            parameters: [
              {
                type: ParametersTypesEnum.Text,
                text: message.profileName || "customer",
              },
            ],
          },
        ],
      },
      to: message.from,
    });
  } catch (error) {
    console.error("Template error:", error);
    await client.messages.text({
      body: "Sorry, couldn't send template. Ensure you have an approved template configured.",
      to: message.from,
    });
  }
}
