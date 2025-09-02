"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
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
import { Menu, Search, X } from "lucide-react";
import { useEffect } from "react";
import React from "react";

import { getContactById } from "@/features/contacts/_lib/queries";

import { getSelectTemplates } from "../marketing-campaigns/new/_components/queries";
import ConversationMenu from "./_components/conversation-menu";
import ConversationMessage from "./_components/conversation-message";
import { ScrollableChats } from "./_components/scrollable-chats";
import { SearchMessageResult } from "./_components/search-message-result";
import { useContactStore } from "./_store/contact-store";
import { useSearchMessageStore } from "./_store/message-store";

interface Props {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getSelectTemplates>>,
      Awaited<ReturnType<typeof getContactById>>,
    ]
  >;
  searchContact: null | string;
}
export function Conversations({ promises, searchContact }: Props) {
  const { contactId, setContactId } = useContactStore();

  const [templates, contact] = React.use(promises);

  useEffect(() => {
    if (searchContact) setContactId(searchContact);
  }, [searchContact, setContactId]);

  return (
    <SidebarProvider
      className="min-h-[90vh]"
      defaultOpen={false}
      style={{
        // @ts-expect-error object-literal
        "--sidebar-width": "20rem",
        "--sidebar-width-mobile": "20rem",
      }}
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
                    className="flex md:hidden mb-4"
                    size="icon"
                    variant="secondary"
                  >
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent className="flex md:hidden" side="left">
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
                    conversation={contact.conversation}
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

  const { searchString, setSearchString } = useSearchMessageStore();

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
          className="mb-2"
          onChange={(e) => {
            e.stopPropagation();
            setSearchString(e.target.value);
          }}
          placeholder="Search in Conversation"
          value={searchString}
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
      className={cn("size-7", className)}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      size="icon"
      variant="ghost"
      {...props}
    >
      <Search />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
