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
import { getContacts } from "@/features/contacts/_lib/queries";
import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { useTitle } from "@/components/provider/title-provider";
import { getSelectTags } from "@/features/tags/_lib/queries";
import { getTableColumns } from "./contact-table-columns";
import { DataTableRowAction } from "@workspace/ui/types/data-table";
import { Contact } from "@workspace/db";
import { FeatureFlagsToggle } from "@/components/provider/feature-flags-toggle";
import UploadCSVContact from "../_components/upload-csv-form";
import ContactNewDialog from "./contact-new-dialog";
import { ContactEditDialog } from "./contact-edit-dialog";

interface ContactTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getContacts>>,
      Awaited<ReturnType<typeof getSelectTags>>,
    ]
  >;
}

export default function ContactTable({ promises }: ContactTableProps) {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Contacts");
  }, [setTitle]);

  const { enableAdvancedFilter } = useFeatureFlags();

  const [{ data, pageCount }, tags] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Contact> | null>(null);

  const columns = React.useMemo(
    () =>
      getTableColumns({
        setRowAction,
        tags,
      }),
    [tags]
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
      columnVisibility: {
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
      <ContactEditDialog
        isOpen={rowAction?.variant === "update"}
        setIsOpen={() => setRowAction(null)}
        title="Edit Contact"
        tags={tags}
        initialValues={{
          name: rowAction?.row.original.name,
          email: rowAction?.row.original.email,
          phoneNumber: rowAction?.row.original.phone,
          tags: rowAction?.row.original.tags ?? [],
        }}
      />

      <DataTable
        table={table}
        actionBar={<ContactsTableActionBar table={table} tags={tags} />}
        pageSizeOptions={[10, 20, 50, 100, 200]}
      >
        <DataTableAdvancedToolbar table={table}>
          <DataTableFilterList
            table={table}
            shallow={shallow}
            debounceMs={debounceMs}
            throttleMs={throttleMs}
            align="end"
          />
          <UploadCSVContact />
          <ContactNewDialog tags={tags} />
          <DataTableSortList table={table} align="start" />
          {/* <FeatureFlagsToggle /> */}
        </DataTableAdvancedToolbar>
      </DataTable>
    </div>
  );
}
