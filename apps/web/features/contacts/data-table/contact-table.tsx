/* eslint-disable perfectionist/sort-objects */
"use client";

import { Contact } from "@workspace/db";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSortList,
} from "@workspace/ui/data-table";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { DataTableRowAction } from "@workspace/ui/types/data-table";
import React, { useEffect } from "react";

import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { FeatureFlagsToggle } from "@/components/provider/feature-flags-toggle";
import { useTitle } from "@/components/provider/title-provider";
import { getContacts } from "@/features/contacts/_lib/queries";
import { getSelectTags } from "@/features/tags/_lib/queries";

import UploadCSVContact from "../_components/upload-csv-form";
import { ContactEditDialog } from "./contact-edit-dialog";
import ContactNewDialog from "./contact-new-dialog";
import { ContactsTableActionBar } from "./contact-table-action-bar";
import { getTableColumns } from "./contact-table-columns";

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

  const { onFilterFlagChange } = useFeatureFlags();

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

  React.useEffect(() => {
    onFilterFlagChange("advancedFilters");
  }, [onFilterFlagChange]);

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: true,
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
        initialValues={{
          name: rowAction?.row.original.name,
          email: rowAction?.row.original.email,
          phoneNumber: rowAction?.row.original.phone,
          tags: rowAction?.row.original.tags ?? [],
        }}
        isOpen={rowAction?.variant === "update"}
        setIsOpen={() => setRowAction(null)}
        tags={tags}
        title="Edit Contact"
      />

      <DataTable
        actionBar={<ContactsTableActionBar table={table} tags={tags} />}
        pageSizeOptions={[10, 20, 50, 100, 200]}
        table={table}
      >
        <DataTableAdvancedToolbar table={table}>
          <DataTableFilterList
            align="end"
            debounceMs={debounceMs}
            shallow={shallow}
            table={table}
            throttleMs={throttleMs}
          />
          <UploadCSVContact />
          <ContactNewDialog tags={tags} />
          <DataTableSortList align="start" table={table} />
          <FeatureFlagsToggle />
        </DataTableAdvancedToolbar>
      </DataTable>
    </div>
  );
}
