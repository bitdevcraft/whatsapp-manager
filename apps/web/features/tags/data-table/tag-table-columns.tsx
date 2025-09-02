"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Tag } from "@workspace/db/schema";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/data-table";
import { formatDate } from "@workspace/ui/lib/format";
import { CalendarIcon, Ellipsis, Text } from "lucide-react";

/* eslint-disable perfectionist/sort-objects */
export const columns: ColumnDef<Tag>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        className="translate-y-0.5"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        className="translate-y-0.5"
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    meta: {
      label: "Name",
      placeholder: "Search names...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<Date>()),
    meta: {
      label: "Created At",
      variant: "date",
      icon: CalendarIcon,
    },
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell: () => (
      <div className="w-full flex justify-end">
        <Button
          aria-label="Open menu"
          className="flex size-8 p-0 data-[state=open]:bg-muted"
          variant="ghost"
        >
          <Ellipsis aria-hidden="true" className="size-4" />
        </Button>
      </div>
    ),
    enableSorting: false,
    size: 40,
  },
];
