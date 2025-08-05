"use client";

import React, { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { cn } from "@workspace/ui/lib/utils";
import { PreviewMessage } from "./preview-message";
import { Conversation } from "@workspace/db";
import { Input } from "@workspace/ui/components/input";
import { useContactStore } from "../_store/contact-store";
import { ChatInfiniteScroll } from "./chat-infinite-scroll";
import { useSearchMessageStore } from "../_store/message-store";

interface PaginatedResponse<T> {
  data: T[];
  nextOffset: number | null;
  previousOffset: number | null;
}

export function ScrollableChats() {
  const contactId = useContactStore((state) => state.contactId);

  const { searchMessageId, setLoading, loading, searchRandomId } =
    useSearchMessageStore();

  const [remaining, setRemaining] = React.useState<number>(0);
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery<PaginatedResponse<Conversation>>({
    queryKey: ["conversations", contactId, searchMessageId, searchRandomId],
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
    initialPageParam: 0,
    getPreviousPageParam: (firstPage) => {
      return Number(firstPage.previousOffset) > 0
        ? firstPage.previousOffset
        : remaining > 0
          ? 0
          : undefined;
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
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
          height: "60vh",
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <ChatInfiniteScroll
          showMiddle={!!searchMessageId}
          hasNext={hasNextPage}
          hasPrevious={hasPreviousPage}
          isReverse={true}
          next={() => {
            console.log("next");
            fetchNextPage();
          }}
          previous={() => {
            console.log("prev");
            fetchPreviousPage();
          }}
          className=" p-4"
          loadingNext={isFetchingNextPage}
          loadingPrevious={isFetchingPreviousPage}
        >
          {data.pages?.map((page) => (
            <React.Fragment key={page.nextOffset}>
              {page.data?.map((el: any) => (
                <div
                  key={el.id}
                  className={cn(
                    `flex mb-2`,
                    el.direction === "inbound" ? "justify-start" : "justify-end"
                  )}
                >
                  {el.body && (
                    <PreviewMessage
                      className={
                        searchMessageId === el.id ? "bg-yellow-200" : ""
                      }
                      input={el.body}
                      date={el.createdAt}
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
