/* eslint-disable perfectionist/sort-objects */
import { Template, whatsAppBusinessAccountsTable } from "@workspace/db";
import { buildConflictUpdateColumns } from "@workspace/db/lib";
import { templatesTable } from "@workspace/db/schema/templates";
import { withTenantTransaction } from "@workspace/db/tenant";
import WhatsApp, {
  ResponsePagination,
  TemplateResponse,
  WhatsAppConfig,
} from "@workspace/wa-cloud-api";
import { eq } from "drizzle-orm";

import { env } from "@/env/server";
import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";

const waPhoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
const waAccessToken = env.WHATSAPP_API_ACCESS_TOKEN;
const waBusinessAccountId = env.WHATSAPP_BUSINESS_ACCOUNT_ID;

if (!waPhoneNumberId || !waAccessToken || !waBusinessAccountId) {
  throw new Error("Environment not defined!");
}

export async function syncTemplate() {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam) {
    return;
  }

  if (!userWithTeam.teamId) {
    return;
  }

  const { teamId } = userWithTeam;

  try {
    await withTenantTransaction(teamId, async (tx) => {
      const account = await tx.query.whatsAppBusinessAccountsTable.findFirst({
        where: eq(whatsAppBusinessAccountsTable.teamId, teamId),
        with: {
          team: {
            with: {
              waBusinessPhoneNumber: true,
            },
          },
        },
      });

      if (!account || !account.accessToken) return;

      const { data, iv } = account.accessToken;

      const decryptAccessToken = await decryptApiKey({
        iv,
        data,
      });

      const config: WhatsAppConfig = {
        accessToken: decryptAccessToken,
        businessAcctId: String(account?.id),
        phoneNumberId: account?.team.waBusinessPhoneNumber[0]?.id,
      };

      const whatsapp = new WhatsApp(config);

      let hasNext: boolean = true;
      let after: string = "";

      const templates: Template[] = [];

      while (hasNext) {
        const response: ResponsePagination<TemplateResponse> =
          await whatsapp.templates.getTemplates({ after });

        const tmp: Template[] = response.data.map(
          (template) =>
            ({
              id: template.id,
              name: template.name,
              content: template,
              teamId,
            }) as Template
        );

        templates.push(...tmp);

        if (!response.paging.next) {
          hasNext = false;
          break;
        }

        after = response.paging.cursors.after;
      }

      // const response = await whatsapp.templates.getTemplates({});
      await tx
        .insert(templatesTable)
        .values(templates)
        .onConflictDoUpdate({
          target: [templatesTable.id],
          set: buildConflictUpdateColumns(templatesTable, ["name", "content"]),
        });
    });
  } catch (error) {
    logger.error(error);
  }
}
