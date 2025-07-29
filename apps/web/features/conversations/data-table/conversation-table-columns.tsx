"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ContactConversation } from "@workspace/db/schema";
import { Button } from "@workspace/ui/components/button";
import { Circle, Text } from "lucide-react";
import { useQueryState } from "nuqs";
import { ConversationContact } from "../_lib/types";

export const columns: ColumnDef<ConversationContact>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: () => <p className="text-center"></p>,

    cell: ({ row }) => {
      const name =
        row.original.contact.name !== ""
          ? row.original.contact.name
          : row.original.contact.phone;

      const [contact, setContact] = useQueryState("contact", {
        defaultValue: "",
        shallow: false,
      });

      const createdDate = row.original.createdAt
        ? new Date(row.original.createdAt)
        : new Date();
      const lastSend: string = formatMessageTimestamp(createdDate);

      return (
        <div className="flex justify-between">
          <div className="flex items-center pl-2">
            {row.original.isUnread && (
              <div className="rounded-full size-4 bg-primary"></div>
            )}
            <Button
              variant="link"
              onClick={() => setContact(row.original.id)}
              className="text-foreground font-light"
            >
              {name}
            </Button>
          </div>
          <p className="font-light text-xs">{lastSend}</p>
        </div>
      );
    },
    enableColumnFilter: true,
  },
];

export function formatMessageTimestamp(date: Date): string {
  const now = new Date();

  // isToday?
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    // e.g. "02:15 PM"
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // build "yesterday" date
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return "yesterday";
  }

  // default: full date, e.g. "6/20/2025"
  return date.toLocaleDateString();
}
