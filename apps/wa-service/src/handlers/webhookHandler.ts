import WhatsApp, {
  MessageTypesEnum,
  WebhookEvent,
  WebhookMessage,
} from "@workspace/wa-cloud-api";

import { handleTextMessage } from "./wa-messages/text/incoming-text";
import { webhookHandler } from "@/config/whatsapp";
import { handleInteractiveMessage } from "./wa-messages/interactive/incoming-interactive";
import { handleImageMessage } from "./wa-messages/image/incoming-image";
import { handleDocumentMessage } from "./wa-messages/document/incoming-document";

// Set up pre-processing handler
webhookHandler.onMessagePreProcess(
  async (client: WhatsApp, message: WebhookMessage) => {
    await client.messages.markAsRead({ messageId: message.id });
  }
);

// Handle text messages
webhookHandler.onMessage(
  MessageTypesEnum.Text,
  async (client: WhatsApp, message: WebhookMessage) => {
    await handleTextMessage(client, message);
  }
);

// Handle interactive messages (button responses)
webhookHandler.onMessage(
  MessageTypesEnum.Interactive,
  async (client: WhatsApp, message: WebhookMessage) => {
    await handleInteractiveMessage(client, message);
  }
);

// Handle image messages
webhookHandler.onMessage(
  MessageTypesEnum.Image,
  async (client: WhatsApp, message: WebhookMessage) => {
    await handleImageMessage(client, message);
  }
);

// Handle document messages
webhookHandler.onMessage(
  MessageTypesEnum.Document,
  async (client: WhatsApp, message: WebhookMessage) => {
    await handleDocumentMessage(client, message);
  }
);

webhookHandler.onEvent("statuses", (event: WebhookEvent) => {
  console.log(event.field);
  console.log(JSON.stringify(event.value));
});
