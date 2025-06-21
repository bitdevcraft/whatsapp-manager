"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Contact } from "@workspace/db/schema/contacts";
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

interface TableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Contact> | null>
  >;
  tags: Awaited<ReturnType<typeof getSelectTags>>;
}

export function getTableColumns({
  setRowAction,
  tags,
}: TableColumnsProps): ColumnDef<Contact>[] {
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
      id: "tags",
      accessorKey: "tags",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ cell }) => {
        const tags = cell.getValue<string[]>() || [];

        const visibleTags = tags.slice(0, 3);
        const hiddenTagCount = tags.length - visibleTags.length;

        return (
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-wrap gap-1 cursor-pointer">
                {visibleTags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {hiddenTagCount > 0 && (
                  <Badge variant="outline">+{hiddenTagCount} more</Badge>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="max-w-xs">
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );
      },
      meta: {
        label: "Tags",
        variant: "multiSelectArray",
        options: tags,
        icon: CircleDashed,
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
        <div className="w-full flex justify-end">
          <Button
            aria-label="Open menu"
            variant="ghost"
            className="flex size-8 p-0 data-[state=open]:bg-muted"
          >
            <Ellipsis className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ),
      enableSorting: false,
      size: 40,
    },
  ];
}
