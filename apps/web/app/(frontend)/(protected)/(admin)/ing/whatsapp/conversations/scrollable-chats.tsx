"use client";

import React, { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { cn } from "@workspace/ui/lib/utils";
import { PreviewMessage } from "./preview-message";
import { Conversation } from "@workspace/db";
import { Input } from "@workspace/ui/components/input";
import { useContactStore } from "./contact-store";
import { ChatInfiniteScroll } from "./_components/chat-infinite-scroll";

interface PaginatedResponse<T> {
  data: T[];
  nextOffset: number | null;
  previousOffset: number | null;
}

export function ScrollableChats() {
  const contactId = useContactStore((state) => state.contactId);

  const [onLoad, setOnLoad] = React.useState<boolean>(true);

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
    queryKey: ["conversations", contactId],
    queryFn: async ({
      pageParam,
    }): Promise<PaginatedResponse<Conversation>> => {
      let url = `/api/whatsapp/conversations/${contactId}?offset=${pageParam}`;

      if (onLoad) {
        url = url.concat(
          `&messageId=${`19d3b555-9f01-4dad-9319-1e80f3c89cb5`}`
        );
      }

      if (pageParam === 0 && remaining) {
        url = url.concat(`&limit=${remaining}`);
      }

      const response = await fetch(url);
      const data = await response.json();

      setOnLoad(false);

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
    return <p>Loading...</p>;
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
          showMiddle={true}
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
          className="bg-gray-50 p-4"
          loadingNext={isFetchingNextPage}
          loadingPrevious={isFetchingPreviousPage}
        >
          {data.pages.map((page) => (
            <React.Fragment key={page.nextOffset}>
              {page.data.map((el: any) => (
                <div
                  key={el.id}
                  className={cn(
                    `flex mb-2`,
                    el.direction === "inbound" ? "justify-start" : "justify-end"
                  )}
                >
                  {el.body && (
                    <PreviewMessage
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
