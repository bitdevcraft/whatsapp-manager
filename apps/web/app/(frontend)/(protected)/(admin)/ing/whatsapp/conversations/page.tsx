import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Menu } from "lucide-react";
import { SearchParams } from "@/types";
import { conversationSearchParamsCache } from "@/features/conversations/_lib/validations";
import { getValidFilters } from "@workspace/ui/lib/data-table";
import {
  getContactConversation,
  getConversations,
} from "@/features/conversations/_lib/queries";
import ConversationTable, {
  ConversationTableProps,
} from "@/features/conversations/data-table/conversation-table";
import React from "react";
import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import ConversationMenu from "./conversation-menu";
import Conversation from "./conversation";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = conversationSearchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getConversations({ ...search, filters: validFilters }),
  ]);
  const promisesConversation = Promise.all([
    getContactConversation(search.contact),
  ]);

  return (
    <div className="flex">
      <div className="p-2 hidden md:flex ">
        <ConversationMenu promises={promises} />
      </div>
      <div className="flex-1 p-2">
        <div className="">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="flex md:hidden mb-4"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex md:hidden">
              <div className="pt-10 px-2">
                <ConversationMenu promises={promises} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="rounded bg-[#ebe5de] bg-background">
          <div className="bg-[url(/whatsapp-bg.png)] bg-opacity-40 ">
            <div className="bg-muted/80 backdrop-invert backdrop-opacity-10 min-h-[87vh]">
              <Conversation promises={promisesConversation} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
