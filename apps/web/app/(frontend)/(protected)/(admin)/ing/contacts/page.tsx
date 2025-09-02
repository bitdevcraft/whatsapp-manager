import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { getValidFilters } from "@workspace/ui/lib/data-table";
import React from "react";

import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";
import { getContacts } from "@/features/contacts/_lib/queries";
import { contactSearchParamsCache } from "@/features/contacts/_lib/validations";
import ContactTable from "@/features/contacts/data-table/contact-table";
import { getSelectTags } from "@/features/tags/_lib/queries";
import { SearchParams } from "@/types";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = contactSearchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getContacts({ ...search, filters: validFilters }),
    getSelectTags(),
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
          <ContactTable promises={promises} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </div>
  );
}
