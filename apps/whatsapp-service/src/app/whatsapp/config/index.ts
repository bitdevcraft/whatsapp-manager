import { WebhookHandler } from "@workspace/wa-cloud-api";

import { getEnv } from "@/lib/env";

const config = {
  accessToken: getEnv("CLOUD_API_ACCESS_TOKEN"),
  // phoneNumberId: Number(getEnv("WA_PHONE_NUMBER_ID")),
  // businessAcctId: getEnv("WA_BUSINESS_ACCOUNT_ID"),
  webhookVerificationToken: getEnv("WEBHOOK_VERIFICATION_TOKEN"),
};

export const webhookHandler = new WebhookHandler(config);
