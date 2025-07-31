"use client";

import React from "react";
import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { ConversationBody } from "@workspace/db/schema";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQueryState } from "nuqs";
import { formatMessageTimestamp } from "@/features/conversations/data-table/conversation-table-columns";
import { useSearchMessageStore } from "../_store/message-store";

interface PageResponse {
  data: {
    id: string | null;
    message: ConversationBody | null;
    createdAt: Date;
    contact: {
      name: string | null;
      phone: string | null;
    };
    isUnread: boolean;
    rn: number;
  }[];
  nextOffset: number | null;
  previousOffset: number | null;
}

export function ScrollableContacts() {
  const queryKey = ["conversation_contacts"];

  const queryFn = async (ctx: QueryFunctionContext): Promise<PageResponse> => {
    const { pageParam } = ctx;

    const response = await axios.get(
      `/api/whatsapp/conversations?offset=${pageParam}`
    );

    console.log(response.data);
    return await response.data;
  };

  const initialPageParam = 0;

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery<PageResponse>({
    queryKey,
    queryFn,
    initialPageParam,
    getPreviousPageParam: (firstPage) => {
      return firstPage.previousOffset ?? undefined;
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });

  const messages = data?.pages.reduce((acc: any, page) => {
    return [...acc, ...page.data];
  }, []);

  console.log(messages?.length, hasNextPage);

  return (
    <>
      <>
        {status === "pending" ? (
          <p>Loading...</p>
        ) : status === "error" ? (
          <span>Error: {error.message}</span>
        ) : (
          <div
            id="scrollable_search_result"
            style={{
              height: "70vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <InfiniteScroll
              dataLength={messages ? messages.length : 0}
              next={() => fetchNextPage()}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
              hasMore={hasNextPage}
              loader={<h4 className="text-center">Loading...</h4>}
              scrollableTarget="scrollable_search_result"
            >
              {data.pages.map((page) => (
                <React.Fragment key={page.nextOffset}>
                  {page.data.map((el) => (
                    <ContactMessageItem key={el.id} item={el} />
                  ))}
                </React.Fragment>
              ))}
            </InfiniteScroll>
          </div>
        )}
      </>

      <ReactQueryDevtools />
    </>
  );
}

function ContactMessageItem({
  item,
  ...props
}: React.ComponentProps<"div"> & {
  item: {
    id: string | null;
    message: ConversationBody | null;
    createdAt: Date;
    contact: {
      name: string | null;
      phone: string | null;
    };
    isUnread: boolean;
    rn: number;
  };
}) {
  const [contact, setContact] = useQueryState("contact", {
    defaultValue: "",
    shallow: false,
  });

  const { clearSearchMessageId } = useSearchMessageStore();

  const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
  const lastSend: string = formatMessageTimestamp(createdDate);
  return (
    <div
      className="flex justify-between p-2 relative h-16 rounded shadow border border-muted"
      onClick={(e) => {
        e.stopPropagation();
        setContact(item.id!);
        clearSearchMessageId();
      }}
      {...props}
    >
      <div className="flex items-center pl-2">
        {item.isUnread && (
          <div className="rounded-full size-2 bg-primary absolute top-2 left-2"></div>
        )}
        {item.contact.name}
      </div>
      <p className="font-light text-xs">{lastSend}</p>
    </div>
  );
}
