"use client";

import { useSocket } from "@/components/provider/socket-provider";
import { logger } from "@/lib/logger";
import { useEffect } from "react";

export default function Notification() {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    logger.log("Socket connected");

    socket.on("whatsapp_message", async () => {
      logger.log("meta webhook socket");
    });

    return () => {
      socket.off("whatsapp_message");
    };
  }, [socket]);

  return <></>;
}
