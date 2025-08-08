import { ConversationBody } from "@workspace/db";
import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";

import { insertConversation } from "../action";

export async function handleInteractiveMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  const body: ConversationBody = {
    body: {
      text: JSON.stringify(message.interactive),
    },
  };

  await insertConversation(body, message);

  if (message.interactive?.type === "button_reply") {
    const buttonId = message.interactive.button_reply?.id;

    if (buttonId === "help_button") {
      await client.messages.text({
        body: `Available commands:
    - hello/hi: Get a greeting
    - help: Show this help message
    - info: Get account information
    - template: See a template example
    - interactive: See interactive message example`,
        to: message.from,
      });
    } else if (buttonId === "info_button") {
      await client.messages.text({
        body: `Your WhatsApp number: ${message.from}
    Profile name: ${message.profileName}
    Our phone: ${message.displayPhoneNumber}`,
        to: message.from,
      });
    }
  }
}
