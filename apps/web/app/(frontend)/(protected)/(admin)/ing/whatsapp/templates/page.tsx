import { SearchParams } from "@/types";
import TemplatePage from "./template-page";
import { templateSearchParamsCache } from "@/features/whatsapp/templates/lib/validations";
import { getValidFilters } from "@workspace/ui/lib/data-table";
import { getTemplates } from "@/features/whatsapp/templates/lib/queries";
import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";
import React from "react";
import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import TemplateTable from "@/features/whatsapp/templates/data-table/template-table";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = templateSearchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getTemplates({ ...search, filters: validFilters }),
  ]);

  return (
    <>
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
            <TemplateTable promises={promises} />
          </React.Suspense>
        </FeatureFlagsProvider>
      </div>
    </>
  );
}
