"use client";

import React from "react";

import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSortList,
  DataTableToolbar,
} from "@workspace/ui/data-table";

import { ContactsTableActionBar } from "./contact-table-action-bar";
import { columns } from "@/features/contacts/data-table/contact-table-columns";
import { getContacts } from "@/features/contacts/data-table/queries";
import { useFeatureFlags } from "@/components/provider/feature-flags-provider";

interface ContactTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getContacts>>]>;
}
export default function ContactTable({ promises }: ContactTableProps) {
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
      <DataTable
        table={table}
        actionBar={<ContactsTableActionBar table={table} />}
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
            <DataTableSortList table={table} align="start" />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <DataTableSortList table={table} align="start" />
          </DataTableToolbar>
        )}
      </DataTable>
    </div>
  );
}
