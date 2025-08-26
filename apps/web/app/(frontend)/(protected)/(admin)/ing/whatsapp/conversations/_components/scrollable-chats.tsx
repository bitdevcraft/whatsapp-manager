/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Conversation } from "@workspace/db/schema";
import { cn } from "@workspace/ui/lib/utils";
import React from "react";

import { useContactStore } from "../_store/contact-store";
import { useSearchMessageStore } from "../_store/message-store";
import { ChatInfiniteScroll } from "./chat-infinite-scroll";
import { PreviewMessage } from "./preview-message";

interface PaginatedResponse<T> {
  data: T[];
  nextOffset: null | number;
  previousOffset: null | number;
}

export function ScrollableChats() {
  const contactId = useContactStore((state) => state.contactId);

  const { loading, searchMessageId, searchRandomId, setLoading } =
    useSearchMessageStore();

  // const [rId, setRid] = useQueryState("rId", parseAsString);

  const [remaining, setRemaining] = React.useState<number>(0);
  const {
    data,
    error,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    status,
  } = useInfiniteQuery<PaginatedResponse<Conversation>>({
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    getPreviousPageParam: (firstPage) => {
      return Number(firstPage.previousOffset) > 0
        ? firstPage.previousOffset
        : remaining > 0
          ? 0
          : undefined;
    },
    initialPageParam: 0,
    queryFn: async ({
      pageParam,
    }): Promise<PaginatedResponse<Conversation>> => {
      let url = `/api/whatsapp/conversations/${contactId}?offset=${pageParam}`;

      if (loading && searchMessageId) {
        url = url.concat(`&messageId=${searchMessageId}`);
      }

      if (pageParam === 0 && remaining) {
        url = url.concat(`&limit=${remaining}`);
      }

      const response = await fetch(url);
      const data = await response.json();

      setLoading(false);

      if (data.previousOffset > 0) {
        setRemaining(data.previousOffset % 10);
      }

      if (data.previousOffset === null) {
        setRemaining(0);
      }

      return data;
    },
    queryKey: [
      "conversations",
      contactId,
      searchMessageId,
      searchRandomId,
      // rId,
    ],
  });

  if (status === "pending") {
    return (
      <div className="flex justify-center py-2 bg-background">
        <div className="animate-spin border-4 border-gray-300 border-t-blue-500 rounded-full w-6 h-6" />
      </div>
    );
  }

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div>
      <div
        id="scrollableDiv"
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          height: "60vh",
          overflow: "auto",
        }}
      >
        <ChatInfiniteScroll
          className=" p-4"
          hasNext={hasNextPage}
          hasPrevious={hasPreviousPage}
          isReverse={true}
          loadingNext={isFetchingNextPage}
          loadingPrevious={isFetchingPreviousPage}
          next={() => {
            fetchNextPage();
          }}
          previous={() => {
            fetchPreviousPage();
          }}
          showMiddle={!!searchMessageId}
        >
          {data.pages?.map((page) => (
            <React.Fragment key={page.nextOffset}>
              {page.data?.map((el: any) => (
                <div
                  className={cn(
                    `flex mb-2`,
                    el.direction === "inbound" ? "justify-start" : "justify-end"
                  )}
                  key={el.id}
                >
                  {el.body && (
                    <PreviewMessage
                      className={
                        searchMessageId === el.id ? "bg-yellow-200" : ""
                      }
                      date={el.createdAt}
                      input={el.body}
                      user={el.user}
                    />
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </ChatInfiniteScroll>
      </div>
    </div>
  );
}
