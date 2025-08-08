import { ConversationBody } from "@workspace/db";
import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";

import { insertConversation } from "../action";

export async function handleDocumentMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  const body: ConversationBody = {
    body: {
      media: {
        id: message.document?.id,
      },
      text: message.document?.filename,
    },
  };

  await insertConversation(body, message);

  await client.messages.text({
    body: "Thanks for the document! I've received it.",
    to: message.from,
  });
}
