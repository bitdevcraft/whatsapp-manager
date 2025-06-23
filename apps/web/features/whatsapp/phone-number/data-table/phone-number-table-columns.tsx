"use client";

import { ColumnDef } from "@tanstack/react-table";
import { WhatsAppBusinessAccountPhoneNumber } from "@workspace/db";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { DataTableColumnHeader } from "@workspace/ui/data-table";
import { formatDate } from "@workspace/ui/lib/format";
import { CalendarIcon, CircleDashed, Ellipsis, Text } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { DataTableRowAction } from "@workspace/ui/types/data-table";
import { getSelectTags } from "@/features/tags/_lib/queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

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
        <div className="w-full flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "register" })}
              >
                Register
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "setup-2FA" })}
              >
                Setup-2FA
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
