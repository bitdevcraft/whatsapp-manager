"use client";

import { useSocket } from "@/components/provider/socket-provider";
import { NotificationEvent } from "@workspace/shared";
import axios from "axios";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Notification() {
  const { socket } = useSocket();

  const revalidateMarketingCampaignById = async (
    teamId: string,
    id: string
  ) => {
    try {
      await axios.post("/api/revalidate", {
        tags: [`${teamId}:${id}`, `marketing-campaigns:${teamId}`],
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!socket) return;
    console.log("Socket connected");

    socket.on(
      NotificationEvent.WhatsAppBulkMessageOutgoingFailed,
      async (data) => {
        console.log("meta webhook socket", data);
        toast.error(data.payload.message);

        await revalidateMarketingCampaignById(data.teamId!, data.relatedId);
      }
    );
    socket.on(
      NotificationEvent.WhatsAppBulkMessageOutgoingProcessing,
      async (data) => {
        console.log("meta webhook socket", data);
        toast.info(data.payload.message);

        await revalidateMarketingCampaignById(data.teamId!, data.relatedId);
      }
    );
    socket.on(
      NotificationEvent.WhatsAppBulkMessageOutgoingSuccess,
      async (data) => {
        console.log("meta webhook socket", data);
        toast.success(data.payload.message);
        await revalidateMarketingCampaignById(data.teamId!, data.relatedId);
      }
    );

    return () => {
      socket.off(NotificationEvent.WhatsAppBulkMessageOutgoingFailed);
      socket.off(NotificationEvent.WhatsAppBulkMessageOutgoingProcessing);
      socket.off(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess);
    };
  }, [socket]);

  return <></>;
}
