/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Conversation, Template, User } from "@workspace/db/schema";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import React, { useMemo } from "react";

import { useContactStore } from "../_store/contact-store";
import { useSearchMessageStore } from "../_store/message-store";
import { ChatInfiniteScroll } from "./chat-infinite-scroll";
import { MessageBubble } from "./message-bubble";
import { DateSeparator } from "./date-separator";
import {
  shouldInsertDateSeparator,
  shouldGroupMessages,
  type Message,
} from "../_lib/message-utils";
import { BubbleChatPreview } from "../../marketing-campaigns/[id]/bubble-chat-preview";

interface PaginatedResponse<T> {
  data: T[];
  nextOffset: null | number;
  previousOffset: null | number;
}

export function ScrollableChats() {
  const contactId = useContactStore((state) => state.contactId);

  const { loading, searchMessageId, searchRandomId, setLoading } =
    useSearchMessageStore();

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
  } = useInfiniteQuery<
    PaginatedResponse<
      Conversation & {
        marketingCampaign?: any;
        template: Template;
        user?: User;
      }
    >
  >({
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
    }): Promise<
      PaginatedResponse<
        Conversation & {
          marketingCampaign?: any;
          template: Template;
          user?: User;
        }
      >
    > => {
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
    ],
  });

  // Flatten all pages into a single array
  const allMessages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data ?? []);
  }, [data]);

  if (status === "pending") {
    return (
      <div className="flex justify-center py-8 bg-background">
        <div className="animate-spin border-4 border-muted border-t-primary rounded-full w-6 h-6" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center h-60">
        <span className="text-muted-foreground">Error: {error.message}</span>
      </div>
    );
  }

  if (allMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div
        id="scrollableDiv"
        className="flex flex-col-reverse h-full overflow-auto px-4 py-2"
        style={{
          maxHeight: "calc(90vh - 14rem)", // Adjust based on header and input height
        }}
      >
        <ChatInfiniteScroll
          anchorDelayMs={300}
          className="space-y-1"
          hasNext={hasNextPage}
          hasPrevious={hasPreviousPage}
          isReverse={true}
          loadingNext={isFetchingNextPage}
          loadingPrevious={isFetchingPreviousPage}
          next={() => fetchNextPage()}
          previous={() => fetchPreviousPage()}
          showMiddle={!!searchMessageId}
        >
          {allMessages.map((message: any, index: number) => {
            const prevMessage = allMessages[index - 1];
            const nextMessage = allMessages[index + 1];

            // Helper to safely get direction
            const getDirection = (msg: any): "inbound" | "outbound" =>
              msg.direction || "outbound";

            const messageDirection = getDirection(message);

            // Check if we need a date separator before this message
            const needsDateSeparator =
              !prevMessage ||
              shouldInsertDateSeparator(
                { id: prevMessage.id, createdAt: prevMessage.createdAt, direction: getDirection(prevMessage) },
                { id: message.id, createdAt: message.createdAt, direction: messageDirection }
              );

            // Check message grouping
            const isGroupedWithNext =
              nextMessage &&
              shouldGroupMessages(
                { id: message.id, createdAt: message.createdAt, direction: messageDirection, userId: message.userId },
                { id: nextMessage.id, createdAt: nextMessage.createdAt, direction: getDirection(nextMessage), userId: nextMessage.userId }
              );

            const isGroupedWithPrev =
              prevMessage &&
              shouldGroupMessages(
                { id: prevMessage.id, createdAt: prevMessage.createdAt, direction: getDirection(prevMessage), userId: prevMessage.userId },
                { id: message.id, createdAt: message.createdAt, direction: messageDirection, userId: message.userId }
              );

            // Show avatar for inbound messages that start a group
            const showAvatar = messageDirection === "inbound" && !isGroupedWithPrev;

            return (
              <React.Fragment key={message.id}>
                {/* Date Separator */}
                {needsDateSeparator && (
                  <DateSeparator date={message.createdAt} />
                )}

                {/* Message */}
                {message.marketingCampaign || message.templateId ? (
                  // Template message - use existing preview
                  <div
                    className={cn(
                      "flex mb-2",
                      messageDirection === "inbound" ? "justify-start" : "justify-end ml-auto"
                    )}
                  >
                    <div className="mb-4 text-left">
                      {message.marketingCampaign ? (
                        <BubbleChatPreview
                          messageTemplate={message.marketingCampaign.messageTemplate}
                          template={message.marketingCampaign.template.content}
                        />
                      ) : (
                        <BubbleChatPreview
                          messageTemplate={message.messageTemplate}
                          template={message.template}
                        />
                      )}
                      <div className="text-[10px] text-muted-foreground text-right mt-1 pr-1">
                        {new Date(message.createdAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Regular message - use new MessageBubble
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <div>
                        <MessageBubble
                          body={message.body}
                          createdAt={message.createdAt}
                          direction={messageDirection}
                          isRead={message.isRead}
                          isDelivered={message.isDelivered}
                          isError={message.isError}
                          isGrouped={isGroupedWithNext}
                          isGroupEnd={!isGroupedWithNext}
                          searchHighlight={searchMessageId === message.id}
                          senderEmail={message.user?.email}
                          showAvatar={showAvatar}
                          avatar={
                            showAvatar ? (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-[10px] bg-muted">
                                  {message.user?.name?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                            ) : undefined
                          }
                        />
                      </div>
                    </TooltipTrigger>
                    {messageDirection !== "inbound" && message.user?.email && (
                      <TooltipContent side="left" sticky="always">
                        <div className="text-xs">
                          <p className="font-medium">Sent by:</p>
                          <p>{message.user.email}</p>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                )}
              </React.Fragment>
            );
          })}
        </ChatInfiniteScroll>
      </div>
    </div>
  );
}
