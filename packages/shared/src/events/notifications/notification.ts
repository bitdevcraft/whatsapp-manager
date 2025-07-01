export enum NotificationEvent {
  WhatsAppBulkMessageOutgoingProcessing = "whatsapp_bulk_message_outgoing_processing",
  WhatsAppBulkMessageOutgoingSuccess = "whatsapp_bulk_message_outgoing_success",
  WhatsAppBulkMessageOutgoingFailed = "whatsapp_bulk_message_outgoing_failed",
  WhatsAppMessageReceived = "whatsapp_message_received",
}

export enum NotificationRelatedObject {
  MarketingCampaign = "marketing-campaigns",
  Conversation = "conversations",
  Contact = "contacts",
  Template = "templates",
}

interface NotificationPayload {
  jobId?: string | null;
  payload: {
    message: string;
    data?: Record<string, any>;
  };
  error?: Error;
  userId?: string;
  teamId: string;
  relatedId: string;
  relatedObject: NotificationRelatedObject;
}

export interface SocketEventPayloads {
  [NotificationEvent.WhatsAppBulkMessageOutgoingProcessing]: (
    data: NotificationPayload
  ) => void;
  [NotificationEvent.WhatsAppBulkMessageOutgoingSuccess]: (
    data: NotificationPayload
  ) => void;
  [NotificationEvent.WhatsAppBulkMessageOutgoingFailed]: (
    data: NotificationPayload
  ) => void;
  [NotificationEvent.WhatsAppMessageReceived]: (
    data: NotificationPayload
  ) => void;
}
