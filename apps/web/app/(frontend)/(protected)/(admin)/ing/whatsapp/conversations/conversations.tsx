"use client";

import { Button } from "@workspace/ui/components/button";
import {
  SheetTrigger,
  SheetContent,
  Sheet,
} from "@workspace/ui/components/sheet";
import ConversationMessage from "./_components/conversation-message";
import ConversationMenu from "./_components/conversation-menu";
import { ScrollableChats } from "./_components/scrollable-chats";
import { Menu, Search, X } from "lucide-react";
import { useContactStore } from "./_store/contact-store";
import { useEffect } from "react";
import { getContactById } from "@/features/contacts/_lib/queries";
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";
import { useSearchMessageStore } from "./_store/message-store";
import { SearchMessageResult } from "./_components/search-message-result";
import { getSelectTemplates } from "../marketing-campaigns/new/_components/queries";

interface Props {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getSelectTemplates>>,
      Awaited<ReturnType<typeof getContactById>>,
    ]
  >;
  searchContact: string | null;
}
export function Conversations({ promises, searchContact }: Props) {
  const { contactId, setContactId } = useContactStore();

  const [templates, contact] = React.use(promises);

  useEffect(() => {
    if (searchContact) setContactId(searchContact);
  }, [searchContact, setContactId]);

  return (
    <SidebarProvider
      defaultOpen={false}
      style={{
        // @ts-expect-error object-literal
        "--sidebar-width": "20rem",
        "--sidebar-width-mobile": "20rem",
      }}
      className="min-h-[90vh]"
    >
      <SidebarInset className="h-[90vh] bg-transparent">
        <div className="flex relative h-[90vh] overflow-hidden">
          <div className="hidden md:grid">
            <ConversationMenu />
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
                    <ConversationMenu />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            {contactId && contact.data && (
              <Card className="h-full relative">
                <CardHeader className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {contact.data.name.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p>{contact.data.name || contact.data.phone}</p>
                  </div>
                  <div></div>
                  <SearchSidebarTrigger />
                </CardHeader>
                <CardContent>
                  <div className="rounded relative h-full">
                    <ScrollableChats />
                  </div>
                </CardContent>
                <CardFooter className="absolute bottom-6 w-full">
                  <ConversationMessage
                    contact={contact.data}
                    lastMessageDate={contact.conversation?.createdAt}
                    templates={templates}
                  />
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
      <SearchSidebar side="right" />
    </SidebarProvider>
  );
}

function SearchSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();

  const { setSearchString, searchString } = useSearchMessageStore();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex gap-4 items-center">
          <Button onClick={toggleSidebar} size="icon" variant="ghost">
            <X />
          </Button>
          <p>Search Messages</p>
        </div>
        <Input
          placeholder="Search in Conversation"
          className="mb-2"
          value={searchString}
          onChange={(e) => {
            e.stopPropagation();
            setSearchString(e.target.value);
          }}
        />
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SearchMessageResult />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

function SearchSidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <Search />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
