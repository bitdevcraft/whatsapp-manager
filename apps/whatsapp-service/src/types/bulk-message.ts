import {
  ComponentTypesEnum,
  MessageRequestParams,
  MessageTemplateObject,
} from "@workspace/wa-cloud-api";

export interface BulkMessageQueue {
  marketingCampaignId: string;
  registryId: string;
  teamId: string;
  template: MessageRequestParams<MessageTemplateObject<ComponentTypesEnum>>;
  userId?: string;
}
