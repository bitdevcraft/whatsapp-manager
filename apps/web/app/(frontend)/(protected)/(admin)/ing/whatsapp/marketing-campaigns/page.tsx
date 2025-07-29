import { getMarketingCampaigns } from "@/features/marketing-campaigns/_lib/queries";
import ContactTable from "@/features/contacts/data-table/contact-table";
import React from "react";
import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { getValidFilters } from "@workspace/ui/lib/data-table";
import { SearchParams } from "@/types";
import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";
import { marketingCampaignSearchParamsCache } from "@/features/marketing-campaigns/_lib/validations";
import MarketingCampaignTable from "@/features/marketing-campaigns/data-table/marketing-campaign-table";

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
              columnCount={7}
              filterCount={2}
              cellWidths={[
                "10rem",
                "30rem",
                "10rem",
                "10rem",
                "6rem",
                "6rem",
                "6rem",
              ]}
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
