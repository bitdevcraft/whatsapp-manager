import { ConversationBody } from "@workspace/db";
import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";

import { insertConversation } from "../action";
import { cmdMessageHandler } from "./incoming-text-cmd";

export async function handleTextMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  if (message.text?.body) {
    const text = message.text.body.toLowerCase();

    // Handle Command Type Message
    const handler = cmdMessageHandler[text];

    const body: ConversationBody = {
      body: {
        text: message.text.body,
      },
    };

    await insertConversation(body, message);

    if (handler) {
      await handler(client, message);
      return;
    }

    // Auto Response from AI
    // const aiResponse = await askAi(text, message.from);
    // // Default response for other text messages
    // await client.messages.text({
    //   body: aiResponse,
    //   to: message.from,
    // });

    return;
  }
}
