import { getUserWithTeam } from "@/lib/db/queries";
import {
  AdAccount,
  Campaign,
  FacebookAdsApi,
} from "facebook-nodejs-business-sdk";

export async function POST() {
  try {
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam?.teamId) {
      return new Response("", {
        status: 400,
        statusText: "No Team",
      });
    }

    const { teamId } = userWithTeam;

    const ad_account_id = "698225195907162";
    const api = FacebookAdsApi.init(process.env.WHATSAPP_API_ACCESS_TOKEN!);

    const account = new AdAccount(`act_${ad_account_id}`, api);

    const response = account.createCampaign([Campaign.Fields.id], {
      [Campaign.Fields.name]: "Page likes campaign",
      [Campaign.Fields.status]: Campaign.Status.paused,
      [Campaign.Fields.objective]: Campaign.Objective.outcome_leads,
      [Campaign.Fields.bid_strategy]:
        Campaign.BidStrategy.lowest_cost_with_bid_cap,
      [Campaign.Fields.special_ad_categories]: [],
      [Campaign.Fields.daily_budget]: 500,
    });

    console.log(response);
    return new Response("", { status: 200 });
  } catch (error) {
    return new Response("", { status: 500 });
  }
}
