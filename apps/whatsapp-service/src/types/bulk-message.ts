import {
  MessageRequestParams,
  MessageTemplateObject,
  ComponentTypesEnum,
} from "@workspace/wa-cloud-api";

export interface BulkMessageQueue {
  registryId: string;
  template: MessageRequestParams<MessageTemplateObject<ComponentTypesEnum>>;
}
