"use client";

import type { Table } from "@tanstack/react-table";

import { MarketingCampaignWithTemplate } from "@workspace/db/schema/marketing-campaigns";
import { Separator } from "@workspace/ui/components/separator";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@workspace/ui/data-table";
import { exportTableToCSV } from "@workspace/ui/lib/export";
import { Download, Trash2 } from "lucide-react";
import * as React from "react";
// import { deleteTasks, updateTasks } from "../_lib/actions";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actions = [
  "update-status",
  "update-priority",
  "export",
  "delete",
] as const;

type Action = (typeof actions)[number];

interface MarketingCampaignsTableActionBarProps {
  table: Table<MarketingCampaignWithTemplate>;
}

export function MarketingCampaignsTableActionBar({
  table,
}: MarketingCampaignsTableActionBarProps) {
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
  }, [table]);

  return (
    <DataTableActionBar table={table} visible={rows.length > 0}>
      <DataTableActionBarSelection table={table} />
      <Separator
        className="hidden data-[orientation=vertical]:h-5 sm:block"
        orientation="vertical"
      />
      <div className="flex items-center gap-1.5">
        <DataTableActionBarAction
          isPending={getIsActionPending("export")}
          onClick={onTaskExport}
          size="icon"
          tooltip="Export Contacts"
        >
          <Download />
        </DataTableActionBarAction>
        <DataTableActionBarAction
          isPending={getIsActionPending("delete")}
          onClick={onTaskDelete}
          size="icon"
          tooltip="Delete Contacts"
        >
          <Trash2 />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
