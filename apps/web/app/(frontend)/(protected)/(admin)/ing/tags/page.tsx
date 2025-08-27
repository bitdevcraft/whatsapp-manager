import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { getValidFilters } from "@workspace/ui/lib/data-table";
import React from "react";

import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";
import { getTags } from "@/features/tags/_lib/queries";
import { tagsSearchParamsCache } from "@/features/tags/_lib/validations";
import TagsTable from "@/features/tags/data-table/tag-table";
import { SearchParams } from "@/types";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = tagsSearchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([getTags({ ...search, filters: validFilters })]);

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
          <TagsTable promises={promises} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </div>
  );
}
