"use client";

import {
  QueryFunctionContext,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ConversationBody } from "@workspace/db/schema";
import axios from "axios";
import { useQueryState } from "nuqs";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { ContactItem } from "./contact-item";
import { useSearchMessageStore } from "../_store/message-store";
import { useContactStore } from "../_store/contact-store";

interface PageResponse {
  data: {
    contact: {
      name: null | string;
      phone: null | string;
    };
    createdAt: Date;
    id: null | string;
    isUnread: boolean;
    message: ConversationBody | null;
    rn: number;
  }[];
  nextOffset: null | number;
  previousOffset: null | number;
}

export function ScrollableContacts() {
  const queryKey = ["conversation_contacts"];

  const queryFn = async (ctx: QueryFunctionContext): Promise<PageResponse> => {
    const { pageParam } = ctx;

    const response = await axios.get(
      `/api/whatsapp/conversations?offset=${pageParam}`
    );

    return await response.data;
  };

  const initialPageParam = 0;

  const { data, error, fetchNextPage, hasNextPage, status } =
    useInfiniteQuery<PageResponse>({
      getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
      getPreviousPageParam: (firstPage) => {
        return firstPage.previousOffset ?? undefined;
      },
      initialPageParam,
      queryFn,
      queryKey,
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = data?.pages.reduce((acc: any, page) => {
    return [...acc, ...page.data];
  }, []);

  const { contactId } = useContactStore();

  if (status === "pending") {
    return (
      <div className="flex flex-col gap-2 p-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg animate-pulse"
          >
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-3 bg-muted/50 rounded w-36" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-destructive text-sm">Error: {error.message}</span>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground text-sm">No conversations yet</p>
        <p className="text-muted-foreground text-xs mt-1">
          Messages will appear here when you start chatting
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        id="scrollable_contact"
        className="flex flex-col overflow-auto"
        style={{
          height: "70vh",
        }}
      >
        <InfiniteScroll
          dataLength={messages ? messages.length : 0}
          hasMore={hasNextPage}
          loader={
            <div className="flex justify-center py-3">
              <div className="animate-spin border-2 border-muted border-t-primary rounded-full w-4 h-4" />
            </div>
          }
          next={() => fetchNextPage()}
          scrollableTarget="scrollable_contact"
        >
          <div className="p-2 space-y-1">
            {data.pages?.map((page) => (
              <React.Fragment key={page.nextOffset}>
                {page.data.map((item) => (
                  <ContactListItem
                    item={item}
                    key={item.id}
                    isActive={contactId === item.id}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </>
  );
}

function ContactListItem({
  item,
  isActive,
}: {
  item: {
    contact: {
      name: null | string;
      phone: null | string;
    };
    createdAt: Date;
    id: null | string;
    isUnread: boolean;
    message: ConversationBody | null;
    rn: number;
  };
  isActive: boolean;
}) {
  const [, setContact] = useQueryState("contact", {
    defaultValue: "",
    shallow: false,
  });

  const queryClient = useQueryClient();
  const [, startTransition] = React.useTransition();
  const { setContactId } = useContactStore();
  const { clearSearchMessageId } = useSearchMessageStore();

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!item.id) return;

      setContact(item.id);
      setContactId(item.id);
      clearSearchMessageId();

      startTransition(async () => {
        try {
          await axios.post("/api/whatsapp/conversations/members", {
            contactId: item.id,
            markAsRead: true,
          });
        } catch (error) {
          // Silently handle error
        }
      });

      queryClient.invalidateQueries({
        queryKey: ["conversation_contacts"],
      });
    },
    [item.id, setContact, setContactId, clearSearchMessageId, queryClient]
  );

  // Extract last message text
  const lastMessageText = item.message?.body?.text || null;

  return (
    <ContactItem
      id={item.id || ""}
      name={item.contact.name}
      phone={item.contact.phone}
      lastMessage={lastMessageText}
      lastMessageTime={item.createdAt}
      isUnread={item.isUnread}
      unreadCount={item.isUnread ? 1 : 0}
      isActive={isActive}
      onClick={handleClick}
    />
  );
}
