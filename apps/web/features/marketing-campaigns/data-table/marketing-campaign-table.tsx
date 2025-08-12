"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSortList,
  DataTableToolbar,
} from "@workspace/ui/data-table";
import { getMarketingCampaigns } from "../_lib/queries";
import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { getTableColumns } from "./marketing-campaign-table-columns";
import { MarketingCampaignsTableActionBar } from "./marketing-campaign-table-action-bar";
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTitle } from "@/components/provider/title-provider";
import { FeatureFlagsToggle } from "@/components/provider/feature-flags-toggle";
import { DataTableRowAction } from "@workspace/ui/types/data-table";
import { MarketingCampaignWithTemplate } from "@workspace/db";
import { CloneMarketingCampaign } from "./marketing-campaign-clone-dialog";

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
    data,
    columns,
    pageCount,
    enableAdvancedFilter: false,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
      pagination: { pageSize: 10, pageIndex: 1 },
      columnVisibility: {},
    },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
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
        table={table}
        actionBar={<MarketingCampaignsTableActionBar table={table} />}
      >
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table}>
            <DataTableFilterList
              table={table}
              shallow={shallow}
              debounceMs={debounceMs}
              throttleMs={throttleMs}
              align="end"
            />
            <Link href={`${pathname}/new`}>
              <Button size="sm" variant="outline">
                <Plus />
                New
              </Button>
            </Link>
            <DataTableSortList table={table} align="start" />
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
            <DataTableSortList table={table} align="start" />
            <FeatureFlagsToggle />
          </DataTableToolbar>
        )}
      </DataTable>
    </div>
  );
}
