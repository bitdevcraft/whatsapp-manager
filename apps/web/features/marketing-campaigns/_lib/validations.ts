import { MarketingCampaign } from "@workspace/db/schema/marketing-campaigns";
import { getSortingStateParser } from "@workspace/ui/lib/parsers";
import { createSearchParamsCache, parseAsArrayOf } from "nuqs/server";
import { z } from "zod";

import { createBaseSearchParams } from "@/lib/validations";

export const marketingCampaignSearchParamsCache = createSearchParamsCache({
  ...createBaseSearchParams<MarketingCampaign>(),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  sort: getSortingStateParser<MarketingCampaign>().withDefault([
    { id: "createdAt", desc: true },
  ]),
});

export type GetMarketingCampaignSchema = Awaited<
  ReturnType<typeof marketingCampaignSearchParamsCache.parse>
>;
