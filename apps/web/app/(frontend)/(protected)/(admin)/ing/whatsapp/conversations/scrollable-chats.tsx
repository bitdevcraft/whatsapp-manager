"use client";

import React from "react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { cn } from "@workspace/ui/lib/utils";
import { PreviewMessage } from "./preview-message";
import { Conversation } from "@workspace/db";
import { Input } from "@workspace/ui/components/input";

interface PaginatedResponse<T> {
  data: T[];
  nextOffset: number | null;
  previousOffset: number | null;
}

export function ScrollableChats({ id }: { id: string }) {
  if (!id) return null;

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
  } = useInfiniteQuery<PaginatedResponse<Conversation>>({
    queryKey: ["conversations"],
    queryFn: async ({
      pageParam,
    }): Promise<PaginatedResponse<Conversation>> => {
      const response = await fetch(
        `/api/whatsapp/conversations/${id}?offset=${pageParam}`
      );
      return await response.json();
    },
    initialPageParam: 0,
    getPreviousPageParam: (firstPage) => {
      return firstPage.previousOffset ?? undefined;
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });

  const messages = data?.pages.reduce((acc: any, page) => {
    return [...acc, ...page.data];
  }, []);

  return (
    <>
      {status === "pending" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <span>Error: {error.message}</span>
      ) : (
        <div>
          <Input placeholder="Search in Conversation" className="mb-2" />
          <div
            id="scrollableDiv"
            style={{
              height: "70vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column-reverse",
            }}
          >
            <InfiniteScroll
              dataLength={messages ? messages.length : 0}
              next={() => fetchNextPage()}
              style={{ display: "flex", flexDirection: "column-reverse" }}
              inverse={true}
              hasMore={hasNextPage}
              loader={<h4 className="text-center">Loading...</h4>}
              scrollableTarget="scrollableDiv"
            >
              {data.pages.map((page) => (
                <React.Fragment key={page.nextOffset}>
                  {page.data.map((el: any) => (
                    <div
                      key={el.id}
                      className={cn(
                        `flex mb-2`,
                        el.direction === "inbound"
                          ? "justify-start"
                          : "justify-end"
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
            </InfiniteScroll>
          </div>
        </div>
      )}
    </>
  );
}
