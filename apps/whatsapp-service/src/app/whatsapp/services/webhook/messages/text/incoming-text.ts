import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";
import { askAi } from "@/utils/gemini";
import { cmdMessageHandler } from "./incoming-text-cmd";
import {
  contactsTable,
  ConversationBody,
  conversationsTable,
  db,
  NewContact,
  NewConversation,
  whatsAppBusinessAccountPhoneNumbersTable,
  whatsAppBusinessAccountsTable,
  withTenantTransaction,
} from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { insertConversation } from "../action";

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
      handler(client, message);
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
