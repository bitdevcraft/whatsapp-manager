import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { getValidFilters } from "@workspace/ui/lib/data-table";
import React from "react";

import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";
import { getMarketingCampaigns } from "@/features/marketing-campaigns/_lib/queries";
import { marketingCampaignSearchParamsCache } from "@/features/marketing-campaigns/_lib/validations";
import MarketingCampaignTable from "@/features/marketing-campaigns/data-table/marketing-campaign-table";
import { SearchParams } from "@/types";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = marketingCampaignSearchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getMarketingCampaigns({ ...search, filters: validFilters }),
  ]);

  return (
    <div className="p-8 bg-background rounded">
      <FeatureFlagsProvider>
        <React.Suspense
          fallback={
            <DataTableSkeleton
              cellWidths={[
                "10rem",
                "30rem",
                "10rem",
                "10rem",
                "6rem",
                "6rem",
                "6rem",
              ]}
              columnCount={7}
              filterCount={2}
              shrinkZero
            />
          }
        >
          <MarketingCampaignTable promises={promises} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </div>
  );
}
