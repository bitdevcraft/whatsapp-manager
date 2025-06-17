import { getUserWithTeam } from "@/lib/db/queries";
import { db } from "@workspace/db/config";
import { templatesTable } from "@workspace/db/schema/templates";
import { withTenantTransaction } from "@workspace/db/tenant";
import { WhatsApp } from "@workspace/wa-cloud-api";

const waPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const waAccessToken = process.env.WHATSAPP_API_ACCESS_TOKEN;
const waBusinessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

if (!waPhoneNumberId || !waAccessToken || !waBusinessAccountId) {
  throw new Error("Environment not defined!");
}

const whatsapp = new WhatsApp({
  phoneNumberId: Number(waPhoneNumberId),
  accessToken: waAccessToken,
  businessAcctId: waBusinessAccountId,
});

export async function syncTemplate() {
  const response = await whatsapp.templates.getTemplates({});

  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam) {
    return;
  }

  if (!userWithTeam.teamId) {
    return;
  }

  try {
    await withTenantTransaction(userWithTeam?.teamId, async (tx) => {
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
    console.error(error);
  }
}
