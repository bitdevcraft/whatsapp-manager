import {
  AdAccount,
  Campaign,
  FacebookAdsApi,
} from "facebook-nodejs-business-sdk";

import { env } from "@/env/server";
import { getUserWithTeam } from "@/lib/db/queries";

export async function POST() {
  try {
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam?.teamId) {
      return new Response("", {
        status: 400,
        statusText: "No Team",
      });
    }

    const ad_account_id = "698225195907162";
    const api = FacebookAdsApi.init(env.WHATSAPP_API_ACCESS_TOKEN!);

    const account = new AdAccount(`act_${ad_account_id}`, api);

    account.createCampaign([Campaign.Fields.id], {
      [Campaign.Fields.bid_strategy]:
        Campaign.BidStrategy.lowest_cost_with_bid_cap,
      [Campaign.Fields.daily_budget]: 500,
      [Campaign.Fields.name]: "Page likes campaign",
      [Campaign.Fields.objective]: Campaign.Objective.outcome_leads,
      [Campaign.Fields.special_ad_categories]: [],
      [Campaign.Fields.status]: Campaign.Status.paused,
    });

    return new Response("", { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new Response("", { status: 500 });
  }
}
