/**
 * Utility functions for message formatting and grouping
 */

export interface MessageGroup {
  messages: Message[];
  userId?: string | null;
  direction: "inbound" | "outbound";
}

export interface Message {
  id: string;
  createdAt: Date | string;
  direction: "inbound" | "outbound";
  userId?: string | null;
}

/**
 * Format a date as relative time (e.g., "2m ago", "1h ago", "Yesterday")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const msgDate = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - msgDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return msgDate.toLocaleDateString("en-US", { weekday: "short" });

  return msgDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Format time as HH:MM AM/PM
 */
export function formatTime(date: Date | string): string {
  const msgDate = typeof date === "string" ? new Date(date) : date;
  return msgDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format full date and time
 */
export function formatFullDateTime(date: Date | string): string {
  const msgDate = typeof date === "string" ? new Date(date) : date;
  return msgDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format date for separator (Today, Yesterday, or date)
 */
export function formatDateSeparator(date: Date | string): string {
  const now = new Date();
  const msgDate = typeof date === "string" ? new Date(date) : date;

  // Reset times to midnight for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());

  const diffDays = Math.floor((today.getTime() - msgDay.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return msgDate.toLocaleDateString("en-US", { weekday: "long" });

  return msgDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: msgDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Check if two messages should be grouped together
 * Messages from the same sender within 5 minutes are grouped
 */
export function shouldGroupMessages(prevMsg: Message, currMsg: Message): boolean {
  // Different direction or user means different group
  if (prevMsg.direction !== currMsg.direction) return false;
  if (prevMsg.userId !== currMsg.userId) return false;

  // Check time difference (5 minutes)
  const prevDate = typeof prevMsg.createdAt === "string" ? new Date(prevMsg.createdAt) : prevMsg.createdAt;
  const currDate = typeof currMsg.createdAt === "string" ? new Date(currMsg.createdAt) : currMsg.createdAt;
  const diffMs = currDate.getTime() - prevDate.getTime();
  const fiveMins = 5 * 60 * 1000;

  return diffMs < fiveMins && diffMs >= 0;
}

/**
 * Group messages by sender and time
 */
export function groupMessages(messages: Message[]): MessageGroup[] {
  if (!messages || messages.length === 0) return [];

  const firstMessage = messages[0];
  if (!firstMessage) return [];

  const groups: MessageGroup[] = [];
  let currentGroup: MessageGroup = {
    messages: [firstMessage],
    direction: firstMessage.direction,
    userId: firstMessage.userId,
  };

  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg) continue;

    const lastMsgInGroup = currentGroup.messages[currentGroup.messages.length - 1];
    if (!lastMsgInGroup) continue;

    if (shouldGroupMessages(lastMsgInGroup, msg)) {
      currentGroup.messages.push(msg);
    } else {
      groups.push(currentGroup);
      currentGroup = {
        messages: [msg],
        direction: msg.direction,
        userId: msg.userId,
      };
    }
  }

  groups.push(currentGroup);
  return groups;
}

/**
 * Check if a date separator should be inserted between two messages
 */
export function shouldInsertDateSeparator(prevMsg: Message, currMsg: Message): boolean {
  const prevDate = typeof prevMsg.createdAt === "string" ? new Date(prevMsg.createdAt) : prevMsg.createdAt;
  const currDate = typeof currMsg.createdAt === "string" ? new Date(currMsg.createdAt) : currMsg.createdAt;

  // Reset times to midnight for comparison
  const prevDay = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
  const currDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());

  return prevDay.getTime() !== currDay.getTime();
}

/**
 * Get message status based on direction and read state
 */
export type MessageStatus = "sent" | "delivered" | "read" | "failed";

export function getMessageStatus(
  direction: "inbound" | "outbound",
  isRead?: boolean,
  isDelivered?: boolean,
  isError?: boolean
): MessageStatus | null {
  if (direction === "inbound") return null; // Inbound messages don't have status
  if (isError) return "failed";
  if (isRead) return "read";
  if (isDelivered) return "delivered";
  return "sent";
}
