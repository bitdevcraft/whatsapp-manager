"use client";

import type { Table } from "@tanstack/react-table";

import { SelectTrigger } from "@radix-ui/react-select";
import { type Contact } from "@workspace/db/schema/contacts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@workspace/ui/data-table";
import { exportTableToCSV } from "@workspace/ui/lib/export";
import { CheckCircle2, Download, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import {
  deleteContacts,
  removeContactTags,
  updateContacts,
} from "@/features/contacts/_lib/actions";
import { getSelectTags } from "@/features/tags/_lib/queries";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const router = useRouter();
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<Action | null>(null);

  const getIsActionPending = React.useCallback(
    (action: Action) => isPending && currentAction === action,
    [isPending, currentAction]
  );

  React.useEffect(() => {
    if (!isPending) router.refresh();
  }, [isPending, router]);

  const onContactUpdate = React.useCallback(
    ({ field, value }: { field: "priority" | "tags"; value: string }) => {
      setCurrentAction(field === "tags" ? "update-tags" : "update-priority");
      startTransition(async () => {
        const { error } = await updateContacts({
          [field]: value,
          ids: rows.map((row) => row.original.id),
        });

        if (error) {
          toast.error(error);
          return;
        }
        toast.success("Contacts updated");
      });
    },
    [rows]
  );

  const onContactRemoveTag = React.useCallback(
    ({ value }: { field: "priority" | "tags"; value: string }) => {
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
        toast.success("Contacts updated");
      });
    },
    [rows]
  );

  const onContactExport = React.useCallback(() => {
    setCurrentAction("export");
    startTransition(() => {
      exportTableToCSV(table, {
        excludeColumns: ["select", "actions"],
        onlySelected: true,
      });
    });
  }, [table]);

  const onContactDelete = React.useCallback(() => {
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
        className="hidden data-[orientation=vertical]:h-5 sm:block"
        orientation="vertical"
      />
      <div className="flex items-center gap-1.5">
        <Select
          onValueChange={(value: string) =>
            onContactUpdate({ field: "tags", value })
          }
        >
          <SelectTrigger asChild>
            <DataTableActionBarAction
              isPending={getIsActionPending("update-tags")}
              size="icon"
              tooltip="Update Tags"
            >
              <CheckCircle2 />
            </DataTableActionBarAction>
          </SelectTrigger>
          <SelectContent align="center">
            <SelectGroup>
              {tags.map((tag) => (
                <SelectItem
                  className="capitalize"
                  key={tag.value}
                  value={tag.value}
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
              isPending={getIsActionPending("remove-tags")}
              size="icon"
              tooltip="Remove Tags"
            >
              <XCircle />
            </DataTableActionBarAction>
          </SelectTrigger>
          <SelectContent align="center">
            <SelectGroup>
              {tags.map((tag) => (
                <SelectItem
                  className="capitalize"
                  key={tag.value}
                  value={tag.value}
                >
                  {tag.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DataTableActionBarAction
          disabled
          isPending={getIsActionPending("export")}
          onClick={onContactExport}
          size="icon"
          tooltip="Export Contacts"
        >
          <Download />
        </DataTableActionBarAction>
        <DataTableActionBarAction
          isPending={getIsActionPending("delete")}
          onClick={onContactDelete}
          size="icon"
          tooltip="Delete Contacts"
        >
          <Trash2 />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  );
}
