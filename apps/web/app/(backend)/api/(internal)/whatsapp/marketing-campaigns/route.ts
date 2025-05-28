import { getMarketingCampaigns } from "@/features/marketing-campaigns/get-marketing-campaigns";

export async function GET() {
  const result = await getMarketingCampaigns();
  return new Response(JSON.stringify(result), { status: 200 });
}
