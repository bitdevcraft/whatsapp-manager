"use client";

import { MarketingCampaignWithTemplate } from "@workspace/db";
import { Button } from "@workspace/ui/components/button";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSortList,
  DataTableToolbar,
} from "@workspace/ui/data-table";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { DataTableRowAction } from "@workspace/ui/types/data-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { FeatureFlagsToggle } from "@/components/provider/feature-flags-toggle";
import { useTitle } from "@/components/provider/title-provider";

import { getMarketingCampaigns } from "../_lib/queries";
import { CloneMarketingCampaign } from "./marketing-campaign-clone-dialog";
import { MarketingCampaignsTableActionBar } from "./marketing-campaign-table-action-bar";
import { getTableColumns } from "./marketing-campaign-table-columns";

export const dynamic = "force-dynamic";

interface MarketingCampaignTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getMarketingCampaigns>>]>;
}
export default function MarketingCampaignTable({
  promises,
}: MarketingCampaignTableProps) {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Marketing Campaigns");
  }, [setTitle]);

  const pathname = usePathname();

  const { enableAdvancedFilter } = useFeatureFlags();

  const [{ data, pageCount }] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<MarketingCampaignWithTemplate> | null>(
      null
    );

  const columns = React.useMemo(
    () =>
      getTableColumns({
        setRowAction,
      }),
    []
  );

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    clearOnDefault: true,
    columns,
    data,
    enableAdvancedFilter: false,
    getRowId: (row) => row.id,
    initialState: {
      columnPinning: { right: ["actions"] },
      columnVisibility: {},
      pagination: { pageIndex: 1, pageSize: 10 },
      sorting: [{ desc: true, id: "createdAt" }],
    },
    pageCount,
    shallow: false,
  });

  return (
    <div className="">
      {rowAction && (
        <CloneMarketingCampaign
          isOpen={rowAction?.variant === "clone"}
          recordId={rowAction?.row.id}
          setIsOpen={() => setRowAction(null)}
          title="Are you sure?"
        />
      )}

      <DataTable
        actionBar={<MarketingCampaignsTableActionBar table={table} />}
        table={table}
      >
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table}>
            <DataTableFilterList
              align="end"
              debounceMs={debounceMs}
              shallow={shallow}
              table={table}
              throttleMs={throttleMs}
            />
            <Link href={`${pathname}/new`}>
              <Button size="sm" variant="outline">
                <Plus />
                New
              </Button>
            </Link>
            <DataTableSortList align="start" table={table} />
            <FeatureFlagsToggle />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <Link href={`${pathname}/new`}>
              <Button size="sm" variant="outline">
                <Plus />
                New
              </Button>
            </Link>
            <DataTableSortList align="start" table={table} />
            <FeatureFlagsToggle />
          </DataTableToolbar>
        )}
      </DataTable>
    </div>
  );
}
