"use client";

import { ConversationTableProps } from "@/features/conversations/data-table/conversation-table";
import { Button } from "@workspace/ui/components/button";
import {
  SheetTrigger,
  SheetContent,
  Sheet,
} from "@workspace/ui/components/sheet";
import ConversationMessage from "./conversation-message";
import ConversationMenu from "./conversation-menu";
import { ScrollableChats } from "./scrollable-chats";
import { Menu, Search, UserCircle, X } from "lucide-react";
import { useContactStore } from "./contact-store";
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
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";

export function Conversations({
  promises,
  contactPromise,
  searchContact,
}: ConversationTableProps & {
  searchContact: string | null;
  contactPromise: Promise<Awaited<ReturnType<typeof getContactById>>>;
}) {
  const { contactId, setContactId } = useContactStore();

  const contact = React.use(contactPromise);

  useEffect(() => {
    if (searchContact) setContactId(searchContact);
  }, [searchContact]);

  return (
    <SidebarProvider
      defaultOpen={false}
      style={{
        // @ts-ignore
        "--sidebar-width": "20rem",
        "--sidebar-width-mobile": "20rem",
      }}
    >
      <SidebarInset>
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
                  <div className="rounded bg-[#ebe5de] bg-background relative h-full">
                    <ScrollableChats />
                  </div>
                </CardContent>
                <CardFooter className="absolute bottom-6 w-full">
                  <ConversationMessage contactId={contactId} />
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

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex gap-4 items-center">
          <Button onClick={toggleSidebar} size="icon" variant="ghost">
            <X />
          </Button>
          <p>Search Messages</p>
        </div>
        <Input placeholder="Search in Conversation" className="mb-2" />
      </SidebarHeader>
      <SidebarContent className="p-4">Test</SidebarContent>
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
