"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Contact } from "@workspace/db/schema/contacts";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Contact>[] = [
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
        onClick={() => console.log("Edit", row.original.id)}
        className="text-blue-600"
      >
        Edit
      </button>
    ),
  },
];
