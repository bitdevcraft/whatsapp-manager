/* eslint-disable perfectionist/sort-objects */
import { ColumnDef } from "@tanstack/react-table";
import { MarketingCampaignWithTemplate } from "@workspace/db/schema/marketing-campaigns";
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

import { getMarketingCampaignStatusIcon } from "../_lib/utils";

interface TableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<MarketingCampaignWithTemplate> | null>
  >;
}

export function getTableColumns({
  setRowAction,
}: TableColumnsProps): ColumnDef<MarketingCampaignWithTemplate>[] {
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
          <Link href={`/ing/whatsapp/marketing-campaigns/${row.id}`}>
            {row.original.name}
          </Link>
        );
      },
      enableColumnFilter: true,
    },
    {
      id: "template.name",
      accessorKey: "template.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Template" />
      ),
      enableColumnFilter: true,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const Icon = getMarketingCampaignStatusIcon(row.original.status || "");

        return (
          <Badge className="py-1 [&>svg]:size-3.5" variant="outline">
            <Icon
              className={
                row.original.status === "processing" ? `animate-spin` : ""
              }
            />
            <span className="capitalize">{row.original.status}</span>
          </Badge>
        );
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
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "clone" })}
              >
                Clone
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
