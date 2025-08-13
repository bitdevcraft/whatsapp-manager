"use client";

import React from "react";
import {
  QueryFunctionContext,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { ConversationBody } from "@workspace/db/schema";
import { useQueryState } from "nuqs";
import { useSearchMessageStore } from "../_store/message-store";
import { formatMessageTimestamp } from "@/utils/format-message-timestamp";

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

    return await response.data;
  };

  const initialPageParam = 0;

  const { status, data, error, fetchNextPage, hasNextPage } =
    useInfiniteQuery<PageResponse>({
      queryKey,
      queryFn,
      initialPageParam,
      getPreviousPageParam: (firstPage) => {
        return firstPage.previousOffset ?? undefined;
      },
      getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = data?.pages.reduce((acc: any, page) => {
    return [...acc, ...page.data];
  }, []);

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
        id="scrollable_contact"
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
          scrollableTarget="scrollable_contact"
        >
          {data.pages?.map((page) => (
            <React.Fragment key={page.nextOffset}>
              {page.data.map((el) => (
                <ContactMessageItem key={el.id} item={el} />
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

  const queryClient = useQueryClient();

  const onRead = async () => {
    try {
      await axios.post("/api/whatsapp/conversations/members", {
        contactId: contact,
        markAsRead: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    queryClient.invalidateQueries({
      queryKey: ["conversation_contacts"], // prefix
    });
  };

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
        onRead();
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
