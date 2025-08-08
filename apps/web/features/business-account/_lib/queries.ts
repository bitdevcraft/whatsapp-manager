import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { unstable_cache } from "@/lib/unstable-cache";
import {
  WhatsAppBusinessAccountDetails,
  whatsAppBusinessAccountsTable,
  withTenantTransaction,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { AdAccount, FacebookAdsApi } from "facebook-nodejs-business-sdk";

export async function getWhatsAppBusinessAccountDetails() {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return null;
  }

  const { teamId } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const data = await withTenantTransaction(teamId, async (tx) => {
          const data = await tx.query.whatsAppBusinessAccountsTable.findFirst({
            where: eq(whatsAppBusinessAccountsTable.teamId, teamId),
            with: {
              team: {
                with: {
                  waBusinessPhoneNumber: true,
                },
              },
            },
          });

          return data;
        });

        return data;
      } catch (error) {
        return null;
      }
    },
    [`whatsapp:business-account:${teamId}`],
    {
      revalidate: 10,
      tags: [
        `whatsapp:business-account`,
        `whatsapp:business-account:${teamId}`,
      ],
    }
  )();
}

export async function getAdAccount() {
  const userWithTeam = await getUserWithTeam();

  const defaultReturn = { data: null };

  if (!userWithTeam?.teamId) {
    return defaultReturn;
  }

  const { teamId } = userWithTeam;

  return unstable_cache(
    async () => {
      try {
        const account = await withTenantTransaction(teamId, async (tx) => {
          return await tx.query.whatsAppBusinessAccountsTable.findFirst({
            where: eq(whatsAppBusinessAccountsTable.teamId, teamId),
          });
        });

        if (!account || !account?.accessToken || !account.adAccountId) {
          return defaultReturn;
        }

        const decryptedToken = await decryptApiKey({
          iv: account.accessToken?.iv,
          data: account.accessToken.data,
        });

        const adsApi = FacebookAdsApi.init(decryptedToken);

        const adAccount = new AdAccount(`act_${account.adAccountId}`, adsApi);

        const {
          _data: { accessToken, _debug, _showHeader, locale, ...data },
        } = await adAccount.read([
          AdAccount.Fields.account_id,
          AdAccount.Fields.name,
          AdAccount.Fields.tos_accepted,
        ]);


        return { data };
      } catch (error) {
        logger.error(error);
        return defaultReturn;
      }
    },
    [`ad-account:${teamId}`],
    {
      revalidate: 1,
      tags: [`ad-account:${teamId}`],
    }
  )();
}
