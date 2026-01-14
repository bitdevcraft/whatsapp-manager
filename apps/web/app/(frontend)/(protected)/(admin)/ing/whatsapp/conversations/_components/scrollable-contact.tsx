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

import { formatMessageTimestamp } from "@/utils/format-message-timestamp";

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

  if (status === "pending") {
    return (
      <div className="flex justify-center py-2 bg-background">
        <div className="animate-spin border-4 border-muted border-t-primary rounded-full w-6 h-6" />
      </div>
    );
  }

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }
  return (
    <>
      <div
        id="scrollable_contact"
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
          scrollableTarget="scrollable_contact"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {data.pages?.map((page) => (
            <React.Fragment key={page.nextOffset}>
              {page.data.map((el) => (
                <ContactMessageItem item={el} key={el.id} />
              ))}
            </React.Fragment>
          ))}
        </InfiniteScroll>
      </div>
    </>
  );
}

function ContactMessageItem({
  item,
  ...props
}: React.ComponentProps<"div"> & {
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
}) {
  const [, setContact] = useQueryState("contact", {
    defaultValue: "",
    shallow: false,
  });

  const queryClient = useQueryClient();

  const [, startTransaction] = React.useTransition();

  const onRead = React.useCallback(
    (id: string) => {
      startTransaction(async () => {
        try {
          console.log({
            contactId: id,
            markAsRead: true,
          });

          await axios.post("/api/whatsapp/conversations/members", {
            contactId: id,
            markAsRead: true,
          });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          //
        }
      });

      queryClient.invalidateQueries({
        queryKey: ["conversation_contacts"], // prefix
      });
    },
    [queryClient]
  );

  const { clearSearchMessageId } = useSearchMessageStore();

  const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
  const lastSend: string = formatMessageTimestamp(createdDate);
  return (
    <div
      className="flex justify-between p-2 relative h-16 border-b hover:bg-muted"
      onClick={(e) => {
        e.stopPropagation();
        setContact(item.id!);
        clearSearchMessageId();
        if (item.id) onRead(item.id);
      }}
      {...props}
    >
      <div className="flex items-center pl-2">
        {item.isUnread && (
          <div className="rounded-full size-2 bg-primary absolute top-2 left-2"></div>
        )}
        {item.contact.name || item.contact.phone}
      </div>
      <p className="font-light text-xs">{lastSend}</p>
    </div>
  );
}
