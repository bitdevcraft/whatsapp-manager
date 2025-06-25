import {
  MessageRequestParams,
  MessageTemplateObject,
  ComponentTypesEnum,
} from "@workspace/wa-cloud-api";

export interface BulkMessageQueue {
  registryId: string;
  teamId: string;
  template: MessageRequestParams<MessageTemplateObject<ComponentTypesEnum>>;
}
