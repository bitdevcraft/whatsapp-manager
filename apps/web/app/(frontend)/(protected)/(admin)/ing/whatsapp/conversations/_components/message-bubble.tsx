"use client";

import { ConversationBody } from "@workspace/db";
import { cn } from "@workspace/ui/lib/utils";
import { Check, CheckCheck, AlertCircle } from "lucide-react";
import { ReactNode } from "react";

import { UniversalPreviewBlob } from "@/components/universal-preview-blob";
import { formatFullDateTime, formatTime, getMessageStatus, type MessageStatus } from "../_lib/message-utils";

export interface MessageBubbleProps {
  body: ConversationBody;
  createdAt: Date | string;
  direction: "inbound" | "outbound";
  isRead?: boolean;
  isDelivered?: boolean;
  isError?: boolean;
  showAvatar?: boolean;
  avatar?: ReactNode;
  isGrouped?: boolean;
  isGroupEnd?: boolean;
  searchHighlight?: boolean;
  senderEmail?: string;
}

export function MessageBubble({
  body,
  createdAt,
  direction,
  isRead,
  isDelivered,
  isError,
  showAvatar = false,
  avatar,
  isGrouped = false,
  isGroupEnd = false,
  searchHighlight = false,
  senderEmail,
}: MessageBubbleProps) {
  const status = getMessageStatus(direction, isRead, isDelivered, isError);

  // Border radius based on grouping and direction
  const borderRadius = cn(
    // Outbound (right side)
    direction === "outbound" && [
      isGrouped ? "rounded-tr-sm" : "rounded-tr-lg",
      isGroupEnd ? "rounded-br-sm" : "rounded-br-lg",
      "rounded-tl-lg rounded-bl-lg",
    ],
    // Inbound (left side)
    direction === "inbound" && [
      isGrouped ? "rounded-tl-sm" : "rounded-tl-lg",
      isGroupEnd ? "rounded-bl-sm" : "rounded-bl-lg",
      "rounded-tr-lg rounded-br-lg",
    ]
  );

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[85%] md:max-w-[70%]",
        direction === "inbound" ? "justify-start" : "justify-end ml-auto"
      )}
    >
      {/* Avatar for inbound grouped messages */}
      {direction === "inbound" && showAvatar && (
        <div className="flex-shrink-0 self-end mb-6">
          {avatar || (
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
              ?
            </div>
          )}
        </div>
      )}

      {/* Message bubble container */}
      <div
        className={cn(
          "relative px-3 py-2 shadow-sm",
          borderRadius,
          // Background colors
          direction === "outbound"
            ? "bg-primary/20 dark:bg-primary/30"
            : "bg-background dark:bg-muted border border-border/50",
          searchHighlight && "ring-2 ring-yellow-400 dark:ring-yellow-600"
        )}
        title={senderEmail ? `Sent by: ${senderEmail}` : undefined}
      >
        {/* Media content */}
        {body?.body?.media?.id && (
          <div className="mb-1 overflow-hidden rounded-md">
            <UniversalPreviewBlob
              allowDownload
              modalOnClick
              src={`/api/whatsapp/files?mediaId=${body.body.media.id}`}
            />
          </div>
        )}

        {/* Header text */}
        {body?.header?.text && (
          <div className="mb-1 font-medium text-sm">{body.header.text}</div>
        )}

        {/* Body text */}
        {body?.body?.text && (
          <div className="text-sm break-words whitespace-pre-wrap">{body.body.text}</div>
        )}

        {/* Footer text */}
        {body?.footer && (
          <div className="text-xs text-muted-foreground mt-1">{body.footer}</div>
        )}

        {/* Buttons */}
        {"buttons" in body && body.buttons && body.buttons.length > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            {body.buttons.map((btn: any, i: number) => (
              <button
                key={i}
                className="text-xs bg-accent/50 hover:bg-accent text-accent-foreground px-3 py-1.5 rounded transition-colors text-left"
              >
                {btn.text}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp and status */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 float-right",
            direction === "outbound" ? "text-primary/70 dark:text-primary/60" : "text-muted-foreground"
          )}
        >
          <span className="text-[10px] min-w-[30px] text-right">
            {formatTime(createdAt)}
          </span>

          {/* Message status indicators for outbound messages */}
          {direction === "outbound" && <StatusIcon status={status} />}
        </div>

        {/* Clear float */}
        <div className="clear-both" />
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: MessageStatus | null }) {
  if (!status) return null;

  const iconSize = 14;

  switch (status) {
    case "sent":
      return <Check size={iconSize} className="text-muted-foreground" />;
    case "delivered":
      return <CheckCheck size={iconSize} className="text-muted-foreground" />;
    case "read":
      return <CheckCheck size={iconSize} className="text-blue-500" />;
    case "failed":
      return <AlertCircle size={iconSize} className="text-destructive" />;
    default:
      return null;
  }
}
