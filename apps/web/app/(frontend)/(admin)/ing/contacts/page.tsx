import { getContacts } from "@/features/contacts/data-table/queries";
import ContactTable from "@/features/contacts/data-table/contact-table";
import React from "react";
import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { getValidFilters } from "@workspace/ui/lib/data-table";
import { SearchParams } from "@/types";
import { contactSearchParamsCache } from "@/features/contacts/_lib/validations";
import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = contactSearchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getContacts({ ...search, filters: validFilters }),
  ]);

  return (
    <div className="p-8">
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
          <ContactTable promises={promises} />
        </React.Suspense>
      </FeatureFlagsProvider>
    </div>
  );
}
