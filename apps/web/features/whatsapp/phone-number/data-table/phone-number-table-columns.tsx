/* eslint-disable perfectionist/sort-objects */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { WhatsAppBusinessAccountPhoneNumber } from "@workspace/db";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { DataTableColumnHeader } from "@workspace/ui/data-table";
import { formatDate } from "@workspace/ui/lib/format";
import { DataTableRowAction } from "@workspace/ui/types/data-table";
import {
  CalendarIcon,
  CheckCircle2Icon,
  Ellipsis,
  Text,
  XCircle,
} from "lucide-react";

interface TableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<WhatsAppBusinessAccountPhoneNumber> | null>
  >;
}

export function getTableColumns({
  setRowAction,
}: TableColumnsProps): ColumnDef<WhatsAppBusinessAccountPhoneNumber>[] {
  return [
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
      id: "displayPhoneNumber",
      accessorKey: "displayPhoneNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone Number" />
      ),
      meta: {
        label: "Phone Number",
        placeholder: "Search Phone Number...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: "isPinEnabled",
      accessorKey: "isPinEnabled",
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader column={column} title="Is Pin Enabled" />
        </div>
      ),
      cell: ({ cell }) =>
        cell.getValue() ? (
          <div className="flex justify-center">
            <CheckCircle2Icon className="text-green-500" />
          </div>
        ) : (
          <div className="flex justify-center">
            <XCircle className="text-red-500" />
          </div>
        ),
    },
    {
      id: "isRegistered",
      accessorKey: "isRegistered",
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader column={column} title="Is Registered" />
        </div>
      ),
      cell: ({ cell }) =>
        cell.getValue() ? (
          <div className="flex justify-center">
            <CheckCircle2Icon className="text-green-500" />
          </div>
        ) : (
          <div className="flex justify-center">
            <XCircle className="text-red-500" />
          </div>
        ),
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
      cell: ({ row }) => (
        <div className="w-full flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
                variant="ghost"
              >
                <Ellipsis aria-hidden="true" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                disabled={!!row.original.isRegistered}
                onSelect={() => setRowAction({ row, variant: "register" })}
              >
                1. Register
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={
                  !row.original.isRegistered || !!row.original.isPinEnabled
                }
                onSelect={() => setRowAction({ row, variant: "setup-2FA" })}
              >
                2. Setup-2FA
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      size: 40,
    },
  ];
}
