"use client";

import React, { useEffect } from "react";

import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSortList,
  DataTableToolbar,
} from "@workspace/ui/data-table";

import { TagsTableActionBar } from "./tag-table-action-bar";
import { columns } from "@/features/tags/data-table/tag-table-columns";
import { getTags } from "@/features/tags/_lib/queries";
import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { useTitle } from "@/components/provider/title-provider";
import TagNewDialog from "./tag-new-dialog";

interface TagTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getTags>>]>;
}
export default function TagsTable({ promises }: TagTableProps) {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Tags");
  }, [setTitle]);

  const { enableAdvancedFilter, filterFlag } = useFeatureFlags();

  const [{ data, pageCount }] = React.use(promises);

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: false,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
      pagination: { pageSize: 10, pageIndex: 1 },
      columnVisibility: {
        phone: false,
        email: false,
      },
    },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <div className="">
      <DataTable table={table} actionBar={<TagsTableActionBar table={table} />}>
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table}>
            <DataTableFilterList
              table={table}
              shallow={shallow}
              debounceMs={debounceMs}
              throttleMs={throttleMs}
              align="end"
            />
            <TagNewDialog />
            <DataTableSortList table={table} align="start" />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <TagNewDialog />

            <DataTableSortList table={table} align="start" />
          </DataTableToolbar>
        )}
      </DataTable>
    </div>
  );
}
