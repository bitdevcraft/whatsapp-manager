"use client";

import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import { Contact, ConversationWithContact } from "@workspace/db/schema";
import { cn } from "@workspace/ui/lib/utils";
import axios from "axios";
import { useQueryState } from "nuqs";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { useSearchMessageStore } from "../_store/message-store";
import { useSearchStore } from "../_store/search-store";

interface PageResponse {
  contacts: Contact[];
  data: ConversationWithContact[];
  nextOffset: null | number;
  previousOffset: null | number;
}

export function SearchResult() {
  const search = useSearchStore((state) => state.query);

  const [, setContact] = useQueryState("contact", {
    defaultValue: "",
    shallow: false,
  });
  const { setSearchMessageId } = useSearchMessageStore();

  const queryKey = ["search_result", search];

  const queryFn = async (ctx: QueryFunctionContext): Promise<PageResponse> => {
    const { pageParam } = ctx;

    const response = await axios.get(
      `/api/whatsapp/conversations/search?offset=${pageParam}&search=${search}`
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
      meta: { search },
      queryFn,
      queryKey,
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = data?.pages.reduce((acc: any, page) => {
    return [...acc, ...page.data];
  }, []);

  if (!search) return null;

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
    <>
      <div
        id="scrollable_search_result"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "70vh",
          overflow: "auto",
        }}
      >
        <h1 className="text-center font-semibold">Contacts</h1>
        {data.pages?.map((page) => (
          <React.Fragment key={page.nextOffset}>
            {page.contacts.map((el) => (
              <div
                className={cn(`mb-2 border-b p-2 rounded hover:bg-muted`)}
                key={el.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setContact(el.id);
                }}
              >
                <p className="flex justify-between">
                  <span className="font-medium text-sm">{el.name}</span>
                  &nbsp;
                  <span className="text-xs font-light">{el.phone}</span>
                </p>
              </div>
            ))}
          </React.Fragment>
        ))}

        <h1 className="text-center font-semibold mt-4">Messages</h1>

        <InfiniteScroll
          dataLength={messages ? messages.length : 0}
          hasMore={hasNextPage}
          loader={<h4 className="text-center">Loading...</h4>}
          next={() => fetchNextPage()}
          scrollableTarget="scrollable_search_result"
          style={{ display: "flex", flexDirection: "column" }}
        >
          {data.pages.map((page) => (
            <React.Fragment key={page.nextOffset}>
              {page.data.map((el) => (
                <div
                  className={cn(
                    `mb-2 border-b text-sm p-2 rounded hover:bg-muted`
                  )}
                  key={el.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setContact(el.contact.id);
                    setSearchMessageId(el.id);
                  }}
                >
                  <p>
                    <span className="font-medium">{el.contact.name}</span>
                    &nbsp;
                    <span className="font-light">{el.contact.phone}</span>
                  </p>
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
    </>
  );
}
