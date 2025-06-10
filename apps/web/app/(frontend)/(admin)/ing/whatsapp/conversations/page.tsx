import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { Menu } from "lucide-react";
import { SearchParams } from "@/types";
import { conversationSearchParamsCache } from "@/features/conversations/_lib/validations";
import { getValidFilters } from "@workspace/ui/lib/data-table";
import { getConversations } from "@/features/conversations/_lib/queries";
import ConversationTable, {
  ConversationTableProps,
} from "@/features/conversations/data-table/conversation-table";
import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";
import React from "react";
import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

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
  return (
    <div className="flex">
      <div className="p-2 hidden md:flex">
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
        <div className="border rounded-md bg-[#ebe5de]">
          <div className="bg-[url(/whatsapp-bg.png)] bg-opacity-40 ">
            <div className="bg-muted/80 backdrop-invert backdrop-opacity-10 min-h-[90vh] p-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationMenu({ promises }: ConversationTableProps) {
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
