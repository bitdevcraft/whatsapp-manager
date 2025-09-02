import { MessageTypesEnum } from '@shared/types/enums';

import { MessageRequestBody } from './common';

export type ReactionMessageRequestBody = MessageRequestBody<MessageTypesEnum.Reaction> & ReActionObject;

export interface ReactionParams {
    emoji: string;
    messageId: string;
    to: string;
}

// Reaction Message Types
interface ReActionObject {
    emoji: string;
    message_id: string;
}
