/* eslint-disable @typescript-eslint/no-explicit-any */
export enum NotificationEvent {
  WhatsAppBulkMessageOutgoingFailed = "whatsapp_bulk_message_outgoing_failed",
  WhatsAppBulkMessageOutgoingProcessing = "whatsapp_bulk_message_outgoing_processing",
  WhatsAppBulkMessageOutgoingSuccess = "whatsapp_bulk_message_outgoing_success",
  WhatsAppMessageReceived = "whatsapp_message_received",
}

export enum NotificationRelatedObject {
  Contact = "contacts",
  Conversation = "conversations",
  MarketingCampaign = "marketing-campaigns",
  Template = "templates",
}

export interface SocketEventPayloads {
  [NotificationEvent.WhatsAppBulkMessageOutgoingFailed]: (
    data: NotificationPayload
  ) => void;
  [NotificationEvent.WhatsAppBulkMessageOutgoingProcessing]: (
    data: NotificationPayload
  ) => void;
  [NotificationEvent.WhatsAppBulkMessageOutgoingSuccess]: (
    data: NotificationPayload
  ) => void;
  [NotificationEvent.WhatsAppMessageReceived]: (
    data: NotificationPayload
  ) => void;
}

interface NotificationPayload {
  error?: Error;
  jobId?: null | string;
  payload: {
    data?: Record<string, any>;
    message: string;
  };
  relatedId: string;
  relatedObject: NotificationRelatedObject;
  teamId: string;
  userId?: string;
}
