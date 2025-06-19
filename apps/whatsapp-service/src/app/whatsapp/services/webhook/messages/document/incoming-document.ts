import WhatsApp, { WebhookMessage } from "@workspace/wa-cloud-api";

export async function handleDocumentMessage(
  client: WhatsApp,
  message: WebhookMessage
) {
  console.log("Received document message");

  await client.messages.text({
    body: "Thanks for the document! I've received it.",
    to: message.from,
  });
}
