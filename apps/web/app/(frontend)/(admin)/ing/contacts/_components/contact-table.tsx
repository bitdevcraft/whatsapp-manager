"use client";

import { columns } from "@/features/contacts/columns";
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
import { getContacts } from "@/features/contacts/queries";

interface ContactTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getContacts>>]>;
}
export default function ContactTable({ promises }: ContactTableProps) {
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
    },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <div className="p-8">
      <DataTable
        table={table}
        actionBar={<ContactsTableActionBar table={table} />}
      >
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="start" />
        </DataTableToolbar>
        {/* <DataTableAdvancedToolbar table={table}>
          <DataTableSortList table={table} align="start" />
          <DataTableFilterList
            table={table}
            shallow={shallow}
            debounceMs={debounceMs}
            throttleMs={throttleMs}
            align="start"
          />
        </DataTableAdvancedToolbar> */}
      </DataTable>
    </div>
  );
}
