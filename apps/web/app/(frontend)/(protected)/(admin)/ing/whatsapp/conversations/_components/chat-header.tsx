"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";
import { Search } from "lucide-react";
import React from "react";

export interface ChatHeaderProps {
  avatar?: null | string;
  className?: string;
  isOnline?: boolean;
  lastSeen?: Date | null | string;
  name: null | string;
  onInfo?: () => void;
  onSearch?: () => void;
  phone: null | string;
}

export function ChatHeader({
  avatar,
  className,
  isOnline = false,
  lastSeen,
  name,
  onInfo,
  onSearch,
  phone,
}: ChatHeaderProps) {
  const { toggleSidebar } = useSidebar();

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

  const displayName = name || phone || "Unknown";

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b bg-background",
        className
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage alt={displayName} src={avatar || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        {/* Online status indicator */}
        {isOnline && (
          <span className="absolute bottom-0 right-0 flex h-3 w-3">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary ring-2 ring-background" />
          </span>
        )}
      </div>

      {/* Contact info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-sm truncate">{displayName}</h2>
        {phone && name && (
          <p className="text-xs text-muted-foreground truncate">{phone}</p>
        )}
        {!isOnline && lastSeen && (
          <p className="text-xs text-muted-foreground">last seen recently</p>
        )}
        {isOnline && <p className="text-xs text-primary">online</p>}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {toggleSidebar && (
          <Button
            className="h-8 w-8"
            onClick={toggleSidebar}
            size="icon"
            variant="ghost"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem onClick={onInfo}>
              <Info className="h-4 w-4 mr-2" />
              Contact Info
            </DropdownMenuItem>
            <DropdownMenuItem>View Media</DropdownMenuItem>
            <DropdownMenuItem>Star Messages</DropdownMenuItem>
            <Separator />
            <DropdownMenuItem className="text-destructive">
              Clear Chat
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
    </div>
  );
}
