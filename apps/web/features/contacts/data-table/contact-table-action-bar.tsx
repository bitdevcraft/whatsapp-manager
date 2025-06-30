"use client";

import { type Contact, contactsTable } from "@workspace/db/schema/contacts";
import { SelectTrigger } from "@radix-ui/react-select";
import type { Table } from "@tanstack/react-table";
import { CheckCircle2, Download, Trash2, XCircle } from "lucide-react";
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
import {
  deleteContacts,
  removeContactTags,
  updateContacts,
} from "@/features/contacts/_lib/actions";
import { logger } from "@/lib/logger";
import { getSelectTags } from "@/features/tags/_lib/queries";
// import { deleteTasks, updateTasks } from "../_lib/actions";

const actions = [
  "update-tags",
  "update-priority",
  "remove-tags",
  "export",
  "delete",
] as const;

type Action = (typeof actions)[number];

interface ContactsTableActionBarProps {
  table: Table<Contact>;
  tags: Awaited<ReturnType<typeof getSelectTags>>;
}

export function ContactsTableActionBar({
  table,
  tags,
}: ContactsTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction]
  );

  const onContactUpdate = React.useCallback(
    ({ field, value }: { field: "tags" | "priority"; value: string }) => {
      setCurrentAction(field === "tags" ? "update-tags" : "update-priority");
      startTransition(async () => {
        const { error } = await updateContacts({
          ids: rows.map((row) => row.original.id),
          [field]: value,
        });

        if (error) {
          toast.error(error);
          return;
        }
        toast.success("Tasks updated");
      });
    },
    [rows]
  );

  const onContactRemoveTag = React.useCallback(
    ({ field, value }: { field: "tags" | "priority"; value: string }) => {
      setCurrentAction("remove-tags");
      startTransition(async () => {
        const { error } = await removeContactTags({
          ids: rows.map((row) => row.original.id),
          tag: value,
        });

        if (error) {
          toast.error(error);
          return;
        }
        toast.success("Tasks updated");
      });
    },
    [rows]
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
      const { error } = await deleteContacts({
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
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-5 sm:block"
      />
      <div className="flex items-center gap-1.5">
        <Select
          onValueChange={(value: string) =>
            onContactUpdate({ field: "tags", value })
          }
        >
          <SelectTrigger asChild>
            <DataTableActionBarAction
              size="icon"
              tooltip="Update status"
              isPending={getIsActionPending("update-tags")}
            >
              <CheckCircle2 />
            </DataTableActionBarAction>
          </SelectTrigger>
          <SelectContent align="center">
            <SelectGroup>
              {tags.map((tag) => (
                <SelectItem
                  key={tag.value}
                  value={tag.value}
                  className="capitalize"
                >
                  {tag.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value: string) =>
            onContactRemoveTag({ field: "tags", value })
          }
        >
          <SelectTrigger asChild>
            <DataTableActionBarAction
              size="icon"
              tooltip="Remove Tags"
              isPending={getIsActionPending("remove-tags")}
            >
              <XCircle />
            </DataTableActionBarAction>
          </SelectTrigger>
          <SelectContent align="center">
            <SelectGroup>
              {tags.map((tag) => (
                <SelectItem
                  key={tag.value}
                  value={tag.value}
                  className="capitalize"
                >
                  {tag.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DataTableActionBarAction
          size="icon"
          tooltip="Export Contacts"
          isPending={getIsActionPending("export")}
          onClick={onTaskExport}
          disabled
        >
          <Download />
        </DataTableActionBarAction>
        <DataTableActionBarAction
          size="icon"
          tooltip="Delete Contacts"
          isPending={getIsActionPending("delete")}
          onClick={onTaskDelete}
        >
          <Trash2 />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
