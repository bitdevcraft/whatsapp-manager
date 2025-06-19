import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { whatsAppBusinessAccountsTable } from "@workspace/db";
import { db } from "@workspace/db/config";
import { templatesTable } from "@workspace/db/schema/templates";
import { withTenantTransaction } from "@workspace/db/tenant";
import WhatsApp, { WhatsAppConfig } from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";

const waPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const waAccessToken = process.env.WHATSAPP_API_ACCESS_TOKEN;
const waBusinessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

if (!waPhoneNumberId || !waAccessToken || !waBusinessAccountId) {
  throw new Error("Environment not defined!");
}

// const whatsapp = new WhatsApp({
//   phoneNumberId: Number(waPhoneNumberId),
//   accessToken: waAccessToken,
//   businessAcctId: waBusinessAccountId,
// });

export async function syncTemplate() {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam) {
    return;
  }

  if (!userWithTeam.teamId) {
    return;
  }

  try {
    await withTenantTransaction(userWithTeam?.teamId, async (tx) => {
      const account = await tx.query.whatsAppBusinessAccountsTable.findFirst({
        with: {
          team: {
            with: {
              waBusinessPhoneNumber: true,
            },
          },
        },
        where: eq(whatsAppBusinessAccountsTable.teamId, userWithTeam.teamId!),
      });

      const decryptAccessToken = await decryptApiKey({
        iv: account?.accessToken?.iv!,
        data: account?.accessToken?.data!,
      });

      const config: WhatsAppConfig = {
        accessToken: decryptAccessToken,
        businessAcctId: String(account?.id),
        phoneNumberId: account?.team.waBusinessPhoneNumber[0]?.id,
      };

      const whatsapp = new WhatsApp(config);

      const response = await whatsapp.templates.getTemplates({});
      for (const item of response.data) {
        await tx
          .insert(templatesTable)
          .values({
            id: item.id,
            name: item.name,
            content: item,
            teamId: userWithTeam?.teamId!,
          })
          .onConflictDoUpdate({
            target: [templatesTable.id],
            set: {
              name: item.name,
              content: item,
            },
          });
      }
    });
  } catch (error) {
    logger.error(error);
  }
}
