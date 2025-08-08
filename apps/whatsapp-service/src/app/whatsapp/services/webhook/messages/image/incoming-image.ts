import { ConversationBody } from "@workspace/db";
import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";

import { insertConversation } from "../action";

export async function handleImageMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  const body: ConversationBody = {
    body: {
      media: {
        id: message.image?.id,
      },
      text: message.image?.caption,
    },
  };

  await insertConversation(body, message);

  await client.messages.text({
    body: "Thanks for the image! I've received it.",
    to: message.from,
  });
}
