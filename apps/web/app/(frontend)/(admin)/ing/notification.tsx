"use client";

import { useSocket } from "@/components/provider/socket-provider";
import {
  NotificationEvent,
  NotificationRelatedObject,
} from "@workspace/shared";
import axios from "axios";
import { nanoid } from "nanoid";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Notification() {
  const { socket } = useSocket();

  const [reload, setReload] = useQueryState("rId", {
    defaultValue: "",
    shallow: false,
  });

  const revalidateTagApi = async (
    relatedObject: string,
    teamId: string,
    id: string
  ) => {
    try {
      const tags = [
        `${teamId}:${id}`,
        `${relatedObject}:${teamId}`,
        `${relatedObject}:${teamId}:${id}`,
      ];

      if (relatedObject !== NotificationRelatedObject.Conversation)
        tags.push(`${NotificationRelatedObject.Conversation}:${teamId}`);
      if (relatedObject !== NotificationRelatedObject.MarketingCampaign)
        tags.push(`${NotificationRelatedObject.MarketingCampaign}:${teamId}`);

      await axios.post("/api/revalidate", {
        tags,
      });

      setReload(nanoid());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on(
      NotificationEvent.WhatsAppBulkMessageOutgoingFailed,
      async (data) => {
        toast.error(data.payload.message);

        const { relatedId, relatedObject, teamId } = data;
        await revalidateTagApi(relatedObject, teamId, relatedId);
      }
    );
    socket.on(
      NotificationEvent.WhatsAppBulkMessageOutgoingProcessing,
      async (data) => {
        toast.info(data.payload.message);

        const { relatedId, relatedObject, teamId } = data;
        await revalidateTagApi(relatedObject, teamId, relatedId);
      }
    );
    socket.on(
      NotificationEvent.WhatsAppBulkMessageOutgoingSuccess,
      async (data) => {
        toast.success(data.payload.message);
        const { relatedId, relatedObject, teamId } = data;
        await revalidateTagApi(relatedObject, teamId, relatedId);
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
