"use client";

import React from "react";
import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { cn } from "@workspace/ui/lib/utils";
import axios from "axios";
import { ConversationWithContact } from "@workspace/db/schema";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useContactStore } from "../_store/contact-store";
import { useSearchMessageStore } from "../_store/message-store";

interface PageResponse {
  data: ConversationWithContact[];
  nextOffset: number | null;
  previousOffset: number | null;
}

export function SearchMessageResult() {
  const { searchString, setSearchMessageId } = useSearchMessageStore();

  const { contactId } = useContactStore();

  const queryKey = ["search_result", searchString, contactId];

  const queryFn = async (ctx: QueryFunctionContext): Promise<PageResponse> => {
    const { pageParam } = ctx;

    const response = await axios.get(
      `/api/whatsapp/conversations/search-message?offset=${pageParam}&search=${searchString}&contactId=${contactId}`
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
    meta: { searchString },
  });

  const messages = data?.pages.reduce((acc: any, page) => {
    return [...acc, ...page.data];
  }, []);

  console.log(messages?.length, hasNextPage);

  if (!searchString) return null;
  if (status === "pending") return <p>Loading...</p>;
  if (status === "error") return <span>Error: {error.message}</span>;

  return (
    <>
      <div
        id="scrollable_search_message_result"
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
          style={{ display: "flex", flexDirection: "column" }}
          hasMore={hasNextPage}
          loader={<h4 className="text-center">Loading...</h4>}
          scrollableTarget="scrollable_search_message_result"
        >
          {data.pages?.map((page) => (
            <React.Fragment key={page.nextOffset}>
              {page.data.map((el) => (
                <div
                  key={el.id}
                  className={cn(
                    `mb-2 border text-sm p-2 rounded hover:bg-muted`
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchMessageId(el.id);
                  }}
                >
                  <p>{el.body?.body?.text}</p>
                  <p className="text-xs font-light text-right">
                    {new Date(el.createdAt).toLocaleDateString()}&nbsp;
                    {new Date(el.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </React.Fragment>
          ))}
        </InfiniteScroll>
      </div>
      <ReactQueryDevtools />
    </>
  );
}
