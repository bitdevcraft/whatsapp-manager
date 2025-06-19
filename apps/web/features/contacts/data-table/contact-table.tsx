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

import { ContactsTableActionBar } from "./contact-table-action-bar";
import { columns } from "@/features/contacts/data-table/contact-table-columns";
import { getContacts } from "@/features/contacts/_lib/queries";
import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { useTitle } from "@/components/provider/title-provider";

interface ContactTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getContacts>>]>;
}

export default function ContactTable({ promises }: ContactTableProps) {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Contacts");
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
        createdAt: false,
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
        pageSizeOptions={[10, 20, 50, 100, 200]}
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
