import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";

export async function handleImageMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  console.log("Received image message");

  await client.messages.text({
    body: "Thanks for the image! I've received it.",
    to: message.from,
  });
}
