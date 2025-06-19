import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";
import { askAi } from "@/utils/gemini";
import { cmdMessageHandler } from "./incoming-text-cmd";

export async function handleTextMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  if (message.text?.body) {
    const text = message.text.body.toLowerCase();

    console.log(text);
    // Handle Command Type Message
    const handler = cmdMessageHandler[text];
    if (handler) {
      handler(client, message);
      return;
    }

    // Auto Response from AI
    const aiResponse = await askAi(text, message.from);
    // Default response for other text messages
    await client.messages.text({
      body: aiResponse,
      to: message.from,
    });

    return;
  }
}
