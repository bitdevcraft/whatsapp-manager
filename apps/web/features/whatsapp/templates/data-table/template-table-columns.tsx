/* eslint-disable perfectionist/sort-objects */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Template } from "@workspace/db/schema";
import { Badge } from "@workspace/ui/components/badge";
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
import { CalendarIcon, Ellipsis, Text } from "lucide-react";
import Link from "next/link";

interface TableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Template> | null>
  >;
}

export function getTableColumns({
  setRowAction,
}: TableColumnsProps): ColumnDef<Template>[] {
  return [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       aria-label="Select all"
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && "indeterminate")
    //       }
    //       className="translate-y-0.5"
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       aria-label="Select row"
    //       checked={row.getIsSelected()}
    //       className="translate-y-0.5"
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    //   size: 40,
    // },
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
      cell: ({ row }) => {
        return (
          <Button
            className="text-foreground font-normal"
            onClick={() => setRowAction({ row, variant: "preview" })}
            size={"sm"}
            variant="link"
          >
            <p>{row.original.name}</p>
          </Button>
        );
      },
      enableColumnFilter: true,
    },
    {
      id: "content.status",
      accessorKey: "content.status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        return (
          <Badge className="py-1 [&>svg]:size-3.5" variant="outline">
            {row.original.content?.status}
          </Badge>
        );
      },
      meta: {
        label: "Status",
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
        variant: "date",
        icon: CalendarIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
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
              <DropdownMenuContent>
                <DropdownMenuItem
                  // onSelect={() => setRowAction({ row, variant: "edit" })}
                  asChild
                >
                  <Link
                    href={`/ing/whatsapp/templates/edit/${row.original.id}`}
                  >
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setRowAction({ row, variant: "preview" })}
                >
                  Preview
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
      size: 40,
    },
  ];
}
