"use client";

import ConversationTable, {
  ConversationTableProps,
} from "@/features/conversations/data-table/conversation-table";
import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useQueryState } from "nuqs";
import React from "react";
import { useSearchStore } from "./search-store";
import { useContactStore } from "./contact-store";
import { SearchResult } from "./search-result";

export default function ConversationMenu({ promises }: ConversationTableProps) {
  const [unread, setUnread] = useQueryState("unread", {
    defaultValue: "false",
    shallow: false,
  });

  const [_contact, setContact] = useQueryState("contact", {
    defaultValue: "",
    shallow: false,
  });

  const { query, setQuery } = useSearchStore();

  return (
    <div className="p-4 rounded-md bg-background">
      <Tabs
        defaultValue="all"
        className="w-full md:w-64"
        onValueChange={(v) => {
          setUnread(v);
          setContact("");
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="false">All</TabsTrigger>
          <TabsTrigger value="true">Unread</TabsTrigger>
        </TabsList>

        <Input
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {query ? (
          <>
            <SearchResult />
          </>
        ) : (
          <React.Suspense
            fallback={
              <DataTableSkeleton
                columnCount={7}
                filterCount={2}
                cellWidths={[
                  "10rem",
                  "30rem",
                  "10rem",
                  "10rem",
                  "6rem",
                  "6rem",
                  "6rem",
                ]}
                shrinkZero
              />
            }
          >
            <ScrollArea>
              <ConversationTable promises={promises} />
            </ScrollArea>
          </React.Suspense>
        )}
      </Tabs>
    </div>
  );
}
