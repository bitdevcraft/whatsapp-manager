import { MessageTypesEnum } from '@shared/types/enums';

import { MessageRequestBody, MessageRequestParams } from './common';

export interface TextMessageParams extends MessageRequestParams<string | TextObject> {
    previewUrl?: boolean;
}

export type TextMessageRequestBody = MessageRequestBody<MessageTypesEnum.Text> & {
    [MessageTypesEnum.Text]: [TextObject];
};

// Text Message Types
export interface TextObject {
    body: string;
    preview_url?: boolean;
}
