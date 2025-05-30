"use client";

import { type Contact, contactsTable } from "@workspace/db/schema/contacts";
import { SelectTrigger } from "@radix-ui/react-select";
import type { Table } from "@tanstack/react-table";
import { ArrowUp, CheckCircle2, Download, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@workspace/ui/data-table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { exportTableToCSV } from "@workspace/ui/lib/export";
// import { deleteTasks, updateTasks } from "../_lib/actions";

const actions = [
  "update-status",
  "update-priority",
  "export",
  "delete",
] as const;

type Action = (typeof actions)[number];

interface ContactsTableActionBarProps {
  table: Table<Contact>;
}

export function ContactsTableActionBar({ table }: ContactsTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction]
  );

  const onTaskExport = React.useCallback(() => {
    setCurrentAction("export");
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ["select", "actions"],
        onlySelected: true,
      });
    });
  }, [table]);

  const onTaskDelete = React.useCallback(() => {
    setCurrentAction("delete");
    startTransition(async () => {
      //   const { error } = await deleteTasks({
      //     ids: rows.map((row) => row.original.id),
      //   });

      //   if (error) {
      //     toast.error(error);
      //     return;
      //   }
      table.toggleAllRowsSelected(false);
    });
  }, [rows, table]);

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <div className="flex items-center gap-1.5">
        <DataTableActionBarAction
          size="icon"
          tooltip="Export tasks"
          isPending={getIsActionPending("export")}
          onClick={onTaskExport}
        >
          <Download />
        </DataTableActionBarAction>
        <DataTableActionBarAction
          size="icon"
          tooltip="Delete tasks"
          isPending={getIsActionPending("delete")}
          onClick={onTaskDelete}
        >
          <Trash2 />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
