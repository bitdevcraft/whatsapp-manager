import { createBaseSearchParams } from "@/lib/validations";
import { MarketingCampaign } from "@workspace/db/schema/marketing-campaigns";
import { getSortingStateParser } from "@workspace/ui/lib/parsers";
import { createSearchParamsCache, parseAsArrayOf } from "nuqs/server";
import { z } from "zod";

export const marketingCampaignSearchParamsCache = createSearchParamsCache({
  ...createBaseSearchParams<MarketingCampaign>(),
  sort: getSortingStateParser<MarketingCampaign>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
});

export type GetMarketingCampaignSchema = Awaited<
  ReturnType<typeof marketingCampaignSearchParamsCache.parse>
>;
