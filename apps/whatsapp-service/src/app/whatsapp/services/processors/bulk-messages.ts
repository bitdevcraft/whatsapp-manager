import { waClientRegistry } from "@/instance";
import { waEventQueue } from "@/jobs/queue";
import { decryptApiKey } from "@/lib/crypto";
import { getEnv } from "@/lib/env";
import { BulkMessageQueue } from "@/types/bulk-message";
import { cleanToDigitsOnly } from "@/utils/clean-data";
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
import { monotonicFactory } from "ulid";

const ulid = monotonicFactory();

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

      if (!data || !data.team.waBusinessAccount[0])
        return {
          encryptedApiKey: null,
          phoneNumberId: "",
          businessAcctId: "",
          webhookVerificationToken: "",
          contacts: [],
          messageTemplate: null,
        };

      const where =
        data.tags && data.tags.length > 0
          ? sql`${contactsTable.tags} ?| ARRAY[${sql.join(
              data?.tags?.map((v) => sql`${v}`),
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

      const encryptedApiKey = data.team.waBusinessAccount[0]?.accessToken;
      const phoneNumberId = data.phoneNumber;
      const businessAcctId = data.team.waBusinessAccount[0]?.id;
      const webhookVerificationToken = getEnv("WEBHOOK_VERIFICATION_TOKEN");

      return {
        encryptedApiKey,
        phoneNumberId,
        businessAcctId,
        webhookVerificationToken,
        contacts,
        messageTemplate: data.messageTemplate,
      };
    });

    if (!data.encryptedApiKey) return false;
    if (!data.messageTemplate) return false;

    const apiKey = decryptApiKey({
      iv: data.encryptedApiKey.iv,
      data: data.encryptedApiKey.data,
    });

    const config = {
      accessToken: apiKey,
      phoneNumberId: Number(data.phoneNumberId),
      businessAcctId: String(data.businessAcctId),
      webhookVerificationToken: getEnv("WEBHOOK_VERIFICATION_TOKEN"),
    };

    const whatsapp = new WhatsApp(config);

    const registryId = waClientRegistry.register(whatsapp);

    const messageTemplate: BulkMessageQueue[] = data.contacts.map((contact) => {
      const temp: BulkMessageQueue = {
        registryId,
        teamId: tenantId,
        template: {
          body: data.messageTemplate! as MessageTemplateObject<ComponentTypesEnum>,
          to: contact,
        },
        marketingCampaignId: marketingId,
      };

      return temp;
    });

    await waEventQueue.addBulk(
      messageTemplate.map((r, i) => ({
        name: `${WhatsAppEvents.ProcessingBulkMessagesOutgoing}:${tenantId}`,
        data: r,
      }))
    );
  } catch (error) {
    return false;
  }
}
