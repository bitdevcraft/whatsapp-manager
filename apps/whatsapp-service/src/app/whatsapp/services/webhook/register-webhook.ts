import WhatsApp, {
  MessageTypesEnum,
  WebhookMessage,
} from "@workspace/wa-cloud-api";

import { webhookHandler } from "../../config";
import { handleButtonMessage } from "./messages/button/incoming-button";
import { handleDocumentMessage } from "./messages/document/incoming-document";
import { handleImageMessage } from "./messages/image/incoming-image";
import { handleInteractiveMessage } from "./messages/interactive/incoming-interactive";
import { handleMessageStatus } from "./messages/statuses/message-status";
import { handleTextMessage } from "./messages/text/incoming-text";

export function registerWebhook() {
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

  // Handle button messages
  webhookHandler.onMessage(
    MessageTypesEnum.Button,
    async (client: WhatsApp, message: WebhookMessage) => {
      await handleButtonMessage(client, message);
    }
  );

  // Handle document messages
  webhookHandler.onMessage(
    MessageTypesEnum.Statuses,
    async (client: WhatsApp, message: WebhookMessage) => {
      await handleMessageStatus(client, message);
    }
  );

  webhookHandler.onMessagePostProcess(
    async (client: WhatsApp, message: WebhookMessage) => {
      console.log(JSON.stringify(message));
    }
  );
}
