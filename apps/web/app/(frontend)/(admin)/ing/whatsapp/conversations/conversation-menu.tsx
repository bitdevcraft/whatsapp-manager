"use client";

import ConversationTable, {
  ConversationTableProps,
} from "@/features/conversations/data-table/conversation-table";
import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import React from "react";

export default function ConversationMenu({ promises }: ConversationTableProps) {
  return (
    <div className="border min-h-[90vh] p-4 rounded-md ">
      <Tabs defaultValue="all" className="w-full md:w-96">
        <TabsList className="w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
        {/* <TabsContent value="all">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="unread">Change your password here.</TabsContent> */}

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
      </Tabs>
    </div>
  );
}
