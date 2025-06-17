import { WebhookHandler } from "@workspace/wa-cloud-api";

const config = {
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN || "",
  phoneNumberId: process.env.WA_PHONE_NUMBER_ID
    ? Number(process.env.WA_PHONE_NUMBER_ID)
    : undefined,
  businessAcctId: process.env.WA_BUSINESS_ACCOUNT_ID || "",
  webhookVerificationToken: process.env.WEBHOOK_VERIFICATION_TOKEN || "",
};

const webhookHandler = new WebhookHandler(config);

export { webhookHandler };
