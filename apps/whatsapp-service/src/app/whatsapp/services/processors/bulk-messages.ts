import {
  contactsTable,
  marketingCampaignsTable,
  withTenantTransaction,
} from "@workspace/db";
import { WhatsAppEvents } from "@workspace/shared";
import WhatsApp, {
  ComponentTypesEnum,
  MessageTemplateObject,
} from "@workspace/wa-cloud-api";
import { eq, sql } from "drizzle-orm";

import { waClientRegistry } from "@/instance";
import { waEventQueue } from "@/jobs/queue";
import { decryptApiKey } from "@/lib/crypto";
import { getEnv } from "@/lib/env";
import { BulkMessageQueue } from "@/types/bulk-message";
import { cleanToDigitsOnly } from "@/utils/clean-data";

export async function processOutgoingMarketingCampaign(
  marketingId: string,
  tenantId: string,
  userId: string
) {
  // Get the Team, Marketing Campaign, Whatsapp Account

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

      if (!data?.team.waBusinessAccount[0])
        return {
          businessAcctId: "",
          contacts: [],
          encryptedApiKey: null,
          messageTemplate: null,
          phoneNumberId: "",
          webhookVerificationToken: "",
        };

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
            (await tx.select().from(contactsTable).where(where)).map(
              (contact) => contact.phone
            )
          )
        : [];

      if (data.recipients && data.recipients.length > 0)
        contacts.push(...cleanToDigitsOnly(data.recipients));

      await tx
        .update(marketingCampaignsTable)
        .set({
          totalRecipients: contacts.length,
        })
        .where(eq(marketingCampaignsTable.id, marketingId));

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const encryptedApiKey = data.team.waBusinessAccount[0]?.accessToken;
      const phoneNumberId = data.phoneNumber;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

    if (!data.encryptedApiKey) return false;
    if (!data.messageTemplate) return false;

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

    await waEventQueue.addBulk(
      messageTemplate.map((r) => ({
        data: r,
        name: `${WhatsAppEvents.ProcessingBulkMessagesOutgoing}:${tenantId}`,
      }))
    );
  } catch (error) {
    console.error(error);
    return false;
  }
}
