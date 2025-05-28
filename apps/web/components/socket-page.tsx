"use client";

import { useEffect } from "react";
import { useSocket } from "./socket-provider";
import { Button } from "@workspace/ui/components/button";

export default function SocketPage() {
  const socket = useSocket();

  const onSend = async () => {
    await fetch("/api/whatsapp/send-messages", {
      method: "POST",
      body: "",
    });
  };
  useEffect(() => {
    if (!socket) return;
    console.log("Socket connected");

    socket.on("whatsapp_message", async () => {
      console.log("meta webhook socket");
    });

    return () => {
      socket.off("whatsapp_message");
    };
  }, [socket]);

  return (
    <>
      <Button onClick={onSend}>Send Message</Button>
    </>
  );
}
