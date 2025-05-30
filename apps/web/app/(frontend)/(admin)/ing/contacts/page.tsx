import { getContacts } from "@/features/contacts/queries";
import ContactTable from "./_components/contact-table";
import { searchParamsCache } from "@/lib/validations";
import React from "react";
import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { type SearchParams } from "nuqs/server";
import { getValidFilters } from "@workspace/ui/lib/data-table";
interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getContacts({ ...search, filters: validFilters }),
  ]);

  return (
    <>
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
    </>
  );
}
