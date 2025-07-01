import { ConversationBody } from "@workspace/db";
import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";
import { insertConversation } from "../action";

export async function handleButtonMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  console.log("Received Button message");

  const body: ConversationBody = {
    body: {
      text: message.button?.text,
    },
  };

  await insertConversation(body, message);
}
