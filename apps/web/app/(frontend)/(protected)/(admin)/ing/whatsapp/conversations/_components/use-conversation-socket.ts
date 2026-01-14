"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useSocket } from "@/components/provider/socket-provider";

export interface ConversationMessage {
  id: string;
  contactId: string;
  body: any;
  direction: "inbound" | "outbound";
  createdAt: Date;
  userId?: string | null;
  isRead?: boolean;
  isDelivered?: boolean;
}

export interface TypingData {
  contactId: string;
  isTyping: boolean;
}

export interface MessageStatusData {
  messageId: string;
  contactId: string;
  status: "sent" | "delivered" | "read" | "failed";
}

export interface UseConversationSocketProps {
  contactId: string | null;
  onNewMessage?: (message: ConversationMessage) => void;
  onTypingChange?: (data: TypingData) => void;
  onMessageStatus?: (data: MessageStatusData) => void;
}

/**
 * Hook for real-time conversation updates via Socket.io
 * Note: Socket event types need to be defined in the shared types for full type safety
 */
export function useConversationSocket({
  contactId,
  onNewMessage,
  onTypingChange,
  onMessageStatus,
}: UseConversationSocketProps) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Cast socket to any for custom events that aren't in the typed interface
  const socketAny = socket as any;

  // Handle incoming new message
  useEffect(() => {
    if (!socketAny) return;

    const handleNewMessage = (data: ConversationMessage) => {
      console.log("New message received:", data);

      // Invalidate and refetch messages for this contact
      if (data.contactId) {
        queryClient.invalidateQueries({
          queryKey: ["conversations", data.contactId],
        });

        // Invalidate contact list to show new message preview
        queryClient.invalidateQueries({
          queryKey: ["conversation_contacts"],
        });
      }

      // Call custom callback
      onNewMessage?.(data);
    };

    socketAny.on("whatsapp:new_message", handleNewMessage);

    return () => {
      socketAny.off("whatsapp:new_message", handleNewMessage);
    };
  }, [socketAny, queryClient, onNewMessage]);

  // Handle typing indicator
  useEffect(() => {
    if (!socketAny) return;

    const handleTyping = (data: TypingData) => {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Call callback with typing true
      onTypingChange?.({ ...data, isTyping: true });

      // Auto-clear typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        onTypingChange?.({ ...data, isTyping: false });
      }, 3000);
    };

    socketAny.on("whatsapp:typing", handleTyping);

    return () => {
      socketAny.off("whatsapp:typing", handleTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socketAny, onTypingChange]);

  // Handle message status updates
  useEffect(() => {
    if (!socketAny) return;

    const handleStatus = (data: MessageStatusData) => {
      console.log("Message status updated:", data);

      // Invalidate messages query to reflect status change
      if (data.contactId) {
        queryClient.invalidateQueries({
          queryKey: ["conversations", data.contactId],
        });
      }

      onMessageStatus?.(data);
    };

    socketAny.on("whatsapp:message_status", handleStatus);

    return () => {
      socketAny.off("whatsapp:message_status", handleStatus);
    };
  }, [socketAny, queryClient, onMessageStatus]);

  // Emit typing event
  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!socketAny || !contactId) return;

      socketAny.emit("whatsapp:typing", {
        contactId,
        isTyping,
      });
    },
    [socketAny, contactId]
  );

  // Emit message read event
  const emitMarkAsRead = useCallback(
    (messageId: string) => {
      if (!socketAny || !contactId) return;

      socketAny.emit("whatsapp:mark_read", {
        contactId,
        messageId,
      });
    },
    [socketAny, contactId]
  );

  return {
    emitTyping,
    emitMarkAsRead,
    isConnected: !!socket?.connected,
  };
}
