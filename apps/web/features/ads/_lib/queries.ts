import { decryptApiKey } from "@/lib/crypto";
import { getUserWithTeam } from "@/lib/db/queries";
import { unstable_cache } from "@/lib/unstable-cache";
import { whatsAppBusinessAccountsTable } from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/tenant";
import { eq } from "drizzle-orm";
import {
  AdAccount,
  Campaign,
  FacebookAdsApi,
} from "facebook-nodejs-business-sdk";

export async function getCampaignsDetails() {
  const userWithTeam = await getUserWithTeam();

  const returnError = {
    data: [],
    paging: null,
  };

  if (!userWithTeam?.teamId) {
    return returnError;
  }

  const { teamId } = userWithTeam;

  return await unstable_cache(
    async () => {
      try {
        const account = await withTenantTransaction(teamId, async (tx) => {
          return await tx.query.whatsAppBusinessAccountsTable.findFirst({
            where: eq(whatsAppBusinessAccountsTable.teamId, teamId),
          });
        });

        if (!account || !account?.accessToken || !account.adAccountId) {
          return returnError;
        }

        const decryptedToken = await decryptApiKey({
          iv: account.accessToken?.iv,
          data: account.accessToken.data,
        });

        const adsApi = FacebookAdsApi.init(decryptedToken);

        const adAccount = new AdAccount(`act_${account.adAccountId}`, adsApi);

        const { advantage_state_info, ...fields } = Campaign.Fields;

        const campaignFields = Object.values(fields);

        const campaigns = await adAccount.getCampaigns(campaignFields, {
          limit: 10,
        });

        campaigns.forEach((c, i) =>
          console.log(i, JSON.stringify(c._data.name, null, 2))
        );

        // console.log(JSON.parse(JSON.stringify(campaigns)));

        return returnError;
      } catch (error) {
        console.log(error);
        console.log("ERror");
        return returnError;
      }
    },
    [`meta-ads-campaign:${teamId}`],
    {
      revalidate: 1,
      tags: [`meta-ads-campaign:${teamId}`],
    }
  )();
}
