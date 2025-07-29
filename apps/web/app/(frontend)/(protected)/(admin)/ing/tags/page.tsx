import { getTags } from "@/features/tags/_lib/queries";
import React from "react";
import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { getValidFilters } from "@workspace/ui/lib/data-table";
import { SearchParams } from "@/types";
import { tagsSearchParamsCache } from "@/features/tags/_lib/validations";
import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";
import TagsTable from "@/features/tags/data-table/tag-table";

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
          <TagsTable promises={promises} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </div>
  );
}
