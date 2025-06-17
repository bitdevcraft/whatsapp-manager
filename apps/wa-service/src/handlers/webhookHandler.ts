import WhatsApp, {
  MessageTypesEnum,
  WebhookMessage,
} from "@workspace/wa-cloud-api";

import { handleTextMessage } from "./wa-messages/text/incoming-text";
import { handleInteractiveMessage } from "./wa-messages/interactive/incoming-interactive";
import { handleImageMessage } from "./wa-messages/image/incoming-image";
import { handleDocumentMessage } from "./wa-messages/document/incoming-document";
import { webhookHandler } from "@/config/whatsapp";

// import { WebhookHandler } from "@workspace/wa-cloud-api";

// const config = {
//   accessToken: process.env.CLOUD_API_ACCESS_TOKEN || "",
//   phoneNumberId: process.env.WA_PHONE_NUMBER_ID
//     ? Number(process.env.WA_PHONE_NUMBER_ID)
//     : undefined,
//   businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || "",
//   webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN || "",
// };

// export const webhookHandler = new WebhookHandler(config);

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
    console.log("Text Message");

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

webhookHandler.onMessagePostProcess(
  async (client: WhatsApp, message: WebhookMessage) => {
    console.log(message);
  }
);
