"use client";

import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConversationWithContact } from "@workspace/db/schema";
import { cn } from "@workspace/ui/lib/utils";
import axios from "axios";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { useContactStore } from "../_store/contact-store";
import { useSearchMessageStore } from "../_store/message-store";

interface PageResponse {
  data: ConversationWithContact[];
  nextOffset: null | number;
  previousOffset: null | number;
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
      meta: { searchString },
      queryFn,
      queryKey,
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = data?.pages.reduce((acc: any, page) => {
    return [...acc, ...page.data];
  }, []);

  if (!searchString) return null;
  if (status === "pending") return <p>Loading...</p>;
  if (status === "error") return <span>Error: {error.message}</span>;

  return (
    <>
      <div
        id="scrollable_search_message_result"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "70vh",
          overflow: "auto",
        }}
      >
        <InfiniteScroll
          dataLength={messages ? messages.length : 0}
          hasMore={hasNextPage}
          loader={<h4 className="text-center">Loading...</h4>}
          next={() => fetchNextPage()}
          scrollableTarget="scrollable_search_message_result"
          style={{ display: "flex", flexDirection: "column" }}
        >
          {data.pages?.map((page) => (
            <React.Fragment key={page.nextOffset}>
              {page.data.map((el) => (
                <div
                  className={cn(
                    `mb-2 border text-sm p-2 rounded hover:bg-muted`
                  )}
                  key={el.id}
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
