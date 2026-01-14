"use client";

import { Button } from "@workspace/ui/components/button";
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
import { useEffect, useState } from "react";
import React from "react";

import { getContactById } from "@/features/contacts/_lib/queries";

import { getSelectTemplates } from "../marketing-campaigns/new/_components/queries";
import ConversationMenu from "./_components/conversation-menu";
import ConversationMessage from "./_components/conversation-message";
import { ScrollableChats } from "./_components/scrollable-chats";
import { ChatHeader } from "./_components/chat-header";
import { SearchMessageResult } from "./_components/search-message-result";
import { TypingIndicator } from "./_components/typing-indicator";
import { useConversationSocket } from "./_components/use-conversation-socket";
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

  // Typing indicator state
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (searchContact) setContactId(searchContact);
  }, [searchContact, setContactId]);

  // Real-time socket integration
  useConversationSocket({
    contactId,
    onTypingChange: (data) => {
      if (data.contactId === contactId) {
        setIsTyping(data.isTyping);
      }
    },
  });

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
          {/* Contact list sidebar - desktop */}
          <div className="hidden md:grid border-r bg-muted/30">
            <ConversationMenu />
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col bg-background">
            {/* Mobile menu trigger */}
            <div className="md:hidden p-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="flex md:hidden" side="left">
                  <div className="pt-10 px-2 w-full">
                    <ConversationMenu />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {contactId && contact.data ? (
              <>
                {/* Chat header */}
                <ChatHeader
                  name={contact.data.name}
                  phone={contact.data.phone}
                />

                {/* Messages area */}
                <div className="flex-1 overflow-hidden relative">
                  <ScrollableChats />

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent pt-6">
                      <TypingIndicator />
                    </div>
                  )}
                </div>

                {/* Message input */}
                <ConversationMessage
                  contact={contact.data}
                  conversation={contact.conversation}
                  lastMessageDate={contact.conversation?.createdAt}
                  templates={templates}
                  onTypingChange={(typing) => {
                    // Emit typing via socket (handled internally by the hook)
                  }}
                />
              </>
            ) : (
              // Empty state
              <div className="flex-1 flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">
                    Select a conversation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a contact from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Search sidebar */}
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
            <X className="h-4 w-4" />
          </Button>
          <p className="font-medium">Search Messages</p>
        </div>
        <Input
          className="mt-2"
          onChange={(e) => {
            e.stopPropagation();
            setSearchString(e.target.value);
          }}
          placeholder="Search in conversation..."
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
