"use client";

import { columns } from "@/features/contacts/columns";
import React from "react";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import {
  DataTable,
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

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      columnPinning: { right: ["actions"] },
      pagination: { pageSize: 10, pageIndex: 1 },
    },
    getRowId: (row) => row.id,
    shallow: true,
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
      </DataTable>
    </div>
  );
}
