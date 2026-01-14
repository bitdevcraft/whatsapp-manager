"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";
import { ReactNode } from "react";

type MouseEventHandler = React.MouseEventHandler<HTMLDivElement>;

import { formatRelativeTime } from "../_lib/message-utils";

export interface ContactItemProps {
  id: string;
  name: string | null;
  phone: string | null;
  lastMessage?: string | null;
  lastMessageTime: Date | string;
  isUnread?: boolean;
  unreadCount?: number;
  isActive?: boolean;
  isOnline?: boolean;
  avatar?: string | null;
  onClick?: MouseEventHandler;
  className?: string;
  icon?: ReactNode;
}

export function ContactItem({
  id,
  name,
  phone,
  lastMessage,
  lastMessageTime,
  isUnread = false,
  unreadCount = 0,
  isActive = false,
  isOnline = false,
  avatar,
  onClick,
  className,
  icon,
}: ContactItemProps) {
  // Get initials from name or phone
  const getInitials = () => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        const first = parts[0];
        const last = parts[parts.length - 1];
        if (first?.[0] && last?.[0]) {
          return (first[0] + last[0]).toUpperCase();
        }
      }
      return name[0]?.toUpperCase() || "?";
    }
    if (phone) {
      return phone.slice(-2);
    }
    return "?";
  };

  // Get display name
  const displayName = name || phone || "Unknown";

  // Truncate last message
  const truncatedMessage = lastMessage
    ? lastMessage.length > 35
      ? lastMessage.slice(0, 35) + "..."
      : lastMessage
    : "No messages yet";

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer transition-colors rounded-lg",
        "hover:bg-muted/50",
        isActive && "bg-muted",
        isUnread && "bg-muted/70",
        className
      )}
      onClick={onClick}
      data-contact-id={id}
    >
      {/* Avatar with online status */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar || undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/20 text-primary font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        {/* Online status indicator */}
        {isOnline && (
          <span className="absolute bottom-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
        )}
      </div>

      {/* Contact info */}
      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              "font-medium truncate text-sm",
              isUnread ? "text-foreground font-semibold" : "text-foreground"
            )}
          >
            {displayName}
          </h3>

          {/* Time and unread badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(lastMessageTime)}
            </span>

            {isUnread && unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Last message preview */}
        <div className="flex items-center gap-1 mt-0.5">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <p
            className={cn(
              "text-xs truncate",
              isUnread ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            {truncatedMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
