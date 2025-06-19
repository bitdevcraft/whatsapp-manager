import { getEnv } from "@/lib/env";
import { WebhookHandler } from "@workspace/wa-cloud-api";

const config = {
  accessToken: getEnv("CLOUD_API_ACCESS_TOKEN"),
  phoneNumberId: Number(getEnv("WA_BUSINESS_ACCOUNT_ID")),
  businessAcctId: getEnv("WA_BUSINESS_ACCOUNT_ID"),
  webhookVerificationToken: getEnv("WEBHOOK_VERIFICATION_TOKEN"),
};

export const webhookHandler = new WebhookHandler(config);
