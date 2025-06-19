"use client";

import { logger } from "@/lib/logger";
import { ColumnDef } from "@tanstack/react-table";
import { Conversation } from "@workspace/db/schema/conversations";
import { DataTableColumnHeader } from "@workspace/ui/data-table";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Conversation>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <button
        onClick={() => logger.log("Edit", row.original.id)}
        className="text-blue-600"
      >
        Edit
      </button>
    ),
  },
];
