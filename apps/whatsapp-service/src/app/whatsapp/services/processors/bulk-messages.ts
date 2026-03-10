import {
  campaignErrorLogsTable,
  CampaignErrorType,
  contactsTable,
  marketingCampaignsTable,
  withTenantTransaction,
} from "@workspace/db";
import { WhatsAppEvents } from "@workspace/shared";
import WhatsApp, {
  ComponentTypesEnum,
  MessageTemplateObject,
} from "@workspace/wa-cloud-api";
import { and, eq, isNull, sql } from "drizzle-orm";

import { waClientRegistry } from "@/instance";
import { waEventQueue } from "@/jobs/queue";
import { createCampaignLogger } from "@/lib/logger";
import { decryptApiKey } from "@/lib/crypto";
import { getEnv } from "@/lib/env";
import { BulkMessageQueue } from "@/types/bulk-message";
import { cleanToDigitsOnly } from "@/utils/clean-data";

function classifyError(error: Error | unknown): CampaignErrorType {
  const err = error instanceof Error ? error : new Error(String(error));
  const message = err.message.toLowerCase();

  if (message.includes("network") || message.includes("econnrefused") || message.includes("timeout")) {
    return CampaignErrorType.NETWORK_ERROR;
  }
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return CampaignErrorType.RATE_LIMIT;
  }
  if (message.includes("auth") || message.includes("unauthorized") || message.includes("token")) {
    return CampaignErrorType.AUTH_ERROR;
  }
  if (message.includes("template") || message.includes("invalid template")) {
    return CampaignErrorType.TEMPLATE_ERROR;
  }
  if (message.includes("recipient") || message.includes("phone") || message.includes("invalid number")) {
    return CampaignErrorType.INVALID_RECIPIENT;
  }
  if (message.includes("database") || message.includes("sql")) {
    return CampaignErrorType.DATABASE_ERROR;
  }
  if (message.includes("whatsapp") || message.includes("facebook") || message.includes("meta")) {
    return CampaignErrorType.WHATSAPP_API_ERROR;
  }

  return CampaignErrorType.UNKNOWN_ERROR;
}

async function logCampaignError(
  teamId: string,
  marketingCampaignId: string,
  error: Error | unknown,
  errorType: CampaignErrorType
) {
  try {
    await withTenantTransaction(teamId, async (tx) => {
      await tx.insert(campaignErrorLogsTable).values({
        marketingCampaignId,
        teamId,
        errorType,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : null,
        jobData: { campaignLevel: true, stage: "processOutgoingMarketingCampaign" },
      });
    });
  } catch (logError) {
    console.error("Failed to log campaign error:", logError);
  }
}

export async function processOutgoingMarketingCampaign(
  marketingId: string,
  tenantId: string,
  userId: string
) {
  const campaignLogger = createCampaignLogger({
    marketingCampaignId: marketingId,
    teamId: tenantId,
    userId,
  });

  campaignLogger.info("Processing outgoing marketing campaign", {
    marketingCampaignId: marketingId,
  });

  try {
    const data = await withTenantTransaction(tenantId, async (tx) => {
      const data = await tx.query.marketingCampaignsTable.findFirst({
        where: eq(marketingCampaignsTable.id, marketingId),
        with: {
          team: {
            with: {
              waBusinessAccount: true,
              waBusinessPhoneNumber: true,
            },
          },
        },
      });

      if (!data) {
        campaignLogger.error("Campaign not found", new Error("Campaign not found"));
        return null;
      }

      if (!data.team.waBusinessAccount || data.team.waBusinessAccount.length === 0) {
        campaignLogger.error("No WhatsApp business account found", new Error("No WhatsApp business account found"));
        return null;
      }

      const where =
        data.tags && data.tags.length > 0
          ? sql`${contactsTable.tags} ?| ARRAY[${sql.join(
              data.tags.map((v) => sql`${v}`),
              sql`, `
            )}]`
          : undefined;

      // Get All Contacts
      const contacts = where
        ? cleanToDigitsOnly(
            (
              await tx
                .select()
                .from(contactsTable)
                .where(and(where, isNull(contactsTable.deletedAt)))
            ).map((contact) => contact.phone)
          )
        : [];

      if (data.recipients && data.recipients.length > 0) {
        contacts.push(...cleanToDigitsOnly(data.recipients));
      }

      await tx
        .update(marketingCampaignsTable)
        .set({
          totalRecipients: contacts.length,
        })
        .where(eq(marketingCampaignsTable.id, marketingId));

      const encryptedApiKey = data.team.waBusinessAccount[0]?.accessToken;
      const phoneNumberId = data.phoneNumber;
      const businessAcctId = data.team.waBusinessAccount[0]?.id;
      const webhookVerificationToken = getEnv("WEBHOOK_VERIFICATION_TOKEN");

      return {
        businessAcctId,
        contacts,
        encryptedApiKey,
        messageTemplate: data.messageTemplate,
        phoneNumberId,
        webhookVerificationToken,
      };
    });

    if (!data) {
      const error = new Error("Failed to retrieve campaign data");
      campaignLogger.error("Campaign data retrieval failed", error);
      await logCampaignError(tenantId, marketingId, error, CampaignErrorType.DATABASE_ERROR);
      return false;
    }

    if (!data.encryptedApiKey) {
      const error = new Error("No encrypted API key found");
      campaignLogger.error("No API key found", error);
      await logCampaignError(tenantId, marketingId, error, CampaignErrorType.AUTH_ERROR);
      return false;
    }

    if (!data.messageTemplate) {
      const error = new Error("No message template found");
      campaignLogger.error("No message template found", error);
      await logCampaignError(tenantId, marketingId, error, CampaignErrorType.TEMPLATE_ERROR);
      return false;
    }

    if (data.contacts.length === 0) {
      campaignLogger.warn("No contacts found for campaign");
      return false;
    }

    campaignLogger.info("Found contacts for campaign", {
      contactCount: data.contacts.length,
    });

    const apiKey = decryptApiKey({
      data: data.encryptedApiKey.data,
      iv: data.encryptedApiKey.iv,
    });

    const config = {
      accessToken: apiKey,
      businessAcctId: String(data.businessAcctId),
      phoneNumberId: Number(data.phoneNumberId),
      webhookVerificationToken: getEnv("WEBHOOK_VERIFICATION_TOKEN"),
    };

    const whatsapp = new WhatsApp(config);

    const registryId = waClientRegistry.register(whatsapp);

    const messageTemplate: BulkMessageQueue[] = data.contacts.map((contact) => {
      const temp: BulkMessageQueue = {
        marketingCampaignId: marketingId,
        registryId,
        teamId: tenantId,
        template: {
          body: data.messageTemplate as MessageTemplateObject<ComponentTypesEnum>,
          to: contact,
        },
        userId,
      };

      return temp;
    });

    campaignLogger.info("Adding messages to queue", {
      messageCount: messageTemplate.length,
    });

    await waEventQueue.addBulk(
      messageTemplate.map((r) => ({
        data: r,
        name: `${WhatsAppEvents.ProcessingBulkMessagesOutgoing}:${tenantId}`,
      }))
    );

    campaignLogger.info("Messages queued successfully");

    return true;
  } catch (error) {
    const errorType = classifyError(error);

    campaignLogger.error("Campaign processing failed", error, {
      errorType,
    });

    // Log error to database
    await logCampaignError(
      tenantId,
      marketingId,
      error,
      errorType
    );

    return false;
  }
}
