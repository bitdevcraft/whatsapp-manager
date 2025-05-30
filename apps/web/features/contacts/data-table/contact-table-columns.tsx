"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Contact } from "@workspace/db/schema/contacts";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/data-table";
import { formatDate } from "@workspace/ui/lib/format";
import { CalendarIcon, Ellipsis, Text } from "lucide-react";

export const columns: ColumnDef<Contact>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
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
    id: "phone",
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    meta: {
      label: "Phone",
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    meta: {
      label: "Email",
    },
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
      variant: "dateRange",
      icon: CalendarIcon,
    },
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        aria-label="Open menu"
        variant="ghost"
        className="flex size-8 p-0 data-[state=open]:bg-muted"
      >
        <Ellipsis className="size-4" aria-hidden="true" />
      </Button>
    ),
    enableSorting: false,
    size: 40,
  },
];
