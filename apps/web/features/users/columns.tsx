/* eslint-disable perfectionist/sort-objects */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@workspace/db/schema/users";
import { DataTableColumnHeader } from "@workspace/ui/data-table";

import { logger } from "@/lib/logger";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<User>[] = [
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
        className="text-blue-600"
        onClick={() => logger.log("Edit", row.original.id)}
      >
        Edit
      </button>
    ),
  },
];
