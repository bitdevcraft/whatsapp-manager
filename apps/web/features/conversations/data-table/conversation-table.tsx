"use client";

import React, { useEffect } from "react";

import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { DataTable, DataTableToolbar } from "@workspace/ui/data-table";

import { ConversationsTableActionBar } from "./conversation-table-action-bar";
import { columns } from "@/features/conversations/data-table/conversation-table-columns";
import { getConversations } from "@/features/conversations/_lib/queries";
import { useTitle } from "@/components/provider/title-provider";
import { getSelectTemplates } from "@/app/(frontend)/(protected)/(admin)/ing/whatsapp/marketing-campaigns/new/_components/queries";
import { getContactById } from "@/features/contacts/_lib/queries";

export interface ConversationTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getConversations>>,
      Awaited<ReturnType<typeof getSelectTemplates>>,
      Awaited<ReturnType<typeof getContactById>>,
    ]
  >;
}
export default function ConversationTable({
  promises,
}: ConversationTableProps) {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Conversations");
  }, [setTitle]);

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
    getRowId: (row) => row.id!,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <div className="">
      <DataTable
        table={table}
        actionBar={<ConversationsTableActionBar table={table} />}
        paginationClassName="sm:flex sm:flex-col-reverse"
      >
        <DataTableToolbar table={table} hideViewColumns></DataTableToolbar>
      </DataTable>
    </div>
  );
}
