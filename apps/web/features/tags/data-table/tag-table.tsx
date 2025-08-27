"use client";

import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSortList,
  DataTableToolbar,
} from "@workspace/ui/data-table";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import React, { useEffect } from "react";

import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { FeatureFlagsToggle } from "@/components/provider/feature-flags-toggle";
import { useTitle } from "@/components/provider/title-provider";
import { getTags } from "@/features/tags/_lib/queries";
import { columns } from "@/features/tags/data-table/tag-table-columns";

import TagNewDialog from "./tag-new-dialog";
import { TagsTableActionBar } from "./tag-table-action-bar";

interface TagTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getTags>>]>;
}
export default function TagsTable({ promises }: TagTableProps) {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Tags");
  }, [setTitle]);

  const { enableAdvancedFilter } = useFeatureFlags();

  const [{ data, pageCount }] = React.use(promises);

  const { debounceMs, shallow, table, throttleMs } = useDataTable({
    clearOnDefault: true,
    columns,
    data,
    enableAdvancedFilter: false,
    getRowId: (row) => row.id,
    initialState: {
      columnPinning: { right: ["actions"] },
      columnVisibility: {
        email: false,
        phone: false,
      },
      pagination: { pageIndex: 1, pageSize: 10 },
      sorting: [{ desc: true, id: "createdAt" }],
    },
    pageCount,
    shallow: false,
  });

  return (
    <div className="">
      <DataTable actionBar={<TagsTableActionBar table={table} />} table={table}>
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table}>
            <DataTableFilterList
              align="end"
              debounceMs={debounceMs}
              shallow={shallow}
              table={table}
              throttleMs={throttleMs}
            />
            <TagNewDialog />
            <DataTableSortList align="start" table={table} />
            <FeatureFlagsToggle />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <TagNewDialog />

            <DataTableSortList align="start" table={table} />
            <FeatureFlagsToggle />
          </DataTableToolbar>
        )}
      </DataTable>
    </div>
  );
}
