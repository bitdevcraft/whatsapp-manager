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
  getConversations,
  getConversationSearch,
} from "@/features/conversations/_lib/queries";
import React from "react";
import ConversationMenu from "./conversation-menu";
import Conversation from "./conversation";
import { ScrollableChats } from "./scrollable-chats";
import { SearchResult } from "./search-result";

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

  const searchConversationPromises = Promise.all([
    getConversationSearch(search.search),
  ]);

  return (
    <div className="flex relative h-[90vh] gap-4">
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
        {search.contact && (
          <div className="rounded bg-[#ebe5de] bg-background relative h-[90vh] flex flex-col">
            <div className="bg-opacity-40 grow p-4">
              <ScrollableChats id={search.contact} />
            </div>
            <div className="">
              <Conversation contactId={search.contact} />
            </div>
          </div>
        )}

        <SearchResult />
      </div>
    </div>
  );
}
