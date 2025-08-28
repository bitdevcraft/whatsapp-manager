"use client";

import type { Table } from "@tanstack/react-table";

import { Tag } from "@workspace/db/schema";
import { Separator } from "@workspace/ui/components/separator";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@workspace/ui/data-table";
import { exportTableToCSV } from "@workspace/ui/lib/export";
import { Download, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { deleteTags } from "../_lib/actions";
// import { deleteTasks, updateTasks } from "../_lib/actions";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actions = [
  "update-status",
  "update-priority",
  "export",
  "delete",
] as const;

type Action = (typeof actions)[number];

interface TagsTableActionBarProps {
  table: Table<Tag>;
}

export function TagsTableActionBar({ table }: TagsTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction]
  );

  const onTaskDelete = React.useCallback(() => {
    setCurrentAction("delete");
    startTransition(async () => {
      const { error } = await deleteTags({
        ids: rows.map((row) => row.original.id),
      });

      if (error) {
        toast.error(error);
        return;
      }
      table.toggleAllRowsSelected(false);
    });
  }, [rows, table]);

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        className="hidden data-[orientation=vertical]:h-5 sm:block"
        orientation="vertical"
      />
      <div className="flex items-center gap-1.5">
        <DataTableActionBarAction
          isPending={getIsActionPending("delete")}
          onClick={onTaskDelete}
          size="icon"
          tooltip="Delete Tags"
        >
          <Trash2 />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
