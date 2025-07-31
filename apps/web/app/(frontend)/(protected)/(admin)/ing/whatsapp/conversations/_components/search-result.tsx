"use client";

import React from "react";
import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { cn } from "@workspace/ui/lib/utils";
import axios from "axios";
import { ConversationWithContact, Contact } from "@workspace/db/schema";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useSearchStore } from "../_store/search-store";
import { useContactStore } from "../_store/contact-store";
import { useSearchMessageStore } from "../_store/message-store";
import { useQueryState } from "nuqs";

interface PageResponse {
  data: ConversationWithContact[];
  contacts: Contact[];
  nextOffset: number | null;
  previousOffset: number | null;
}

export function SearchResult() {
  const search = useSearchStore((state) => state.query);

  const [contact, setContact] = useQueryState("contact", {
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
    meta: { search },
  });

  const messages = data?.pages.reduce((acc: any, page) => {
    return [...acc, ...page.data];
  }, []);

  console.log(messages?.length, hasNextPage);

  return (
    <>
      {search ? (
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
              <h1 className="text-center font-semibold">Contacts</h1>
              {data.pages?.map((page) => (
                <React.Fragment key={page.nextOffset}>
                  {page.contacts.map((el) => (
                    <div
                      key={el.id}
                      className={cn(`mb-2 border-b p-2 rounded hover:bg-muted`)}
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
                next={() => fetchNextPage()}
                style={{ display: "flex", flexDirection: "column" }}
                hasMore={hasNextPage}
                loader={<h4 className="text-center">Loading...</h4>}
                scrollableTarget="scrollable_search_result"
              >
                {data.pages.map((page) => (
                  <React.Fragment key={page.nextOffset}>
                    {page.data.map((el) => (
                      <div
                        key={el.id}
                        className={cn(
                          `mb-2 border-b text-sm p-2 rounded hover:bg-muted`
                        )}
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
          )}
        </>
      ) : (
        <></>
      )}
      <ReactQueryDevtools />
    </>
  );
}
