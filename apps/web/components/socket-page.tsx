"use client";

import { useEffect } from "react";
import { useSocket } from "./provider/socket-provider";
import { Button } from "@workspace/ui/components/button";
import { logger } from "@/lib/logger";

export default function SocketPage() {
  const { socket } = useSocket();

  const onSend = async () => {
    await fetch("/api/whatsapp/send-messages", {
      method: "POST",
      body: "",
    });
  };
  // useEffect(() => {
  //   if (!socket) return;
  //   logger.log("Socket connected");

  //   socket.on("whatsapp_message", async () => {
  //     logger.log("meta webhook socket");
  //   });

  //   return () => {
  //     socket.off("whatsapp_message");
  //   };
  // }, [socket]);

  return (
    <>
      <Button onClick={onSend}>Send Message</Button>
    </>
  );
}
