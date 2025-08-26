import { MessageTypesEnum } from '@shared/types/enums';

import { MessageRequestBody } from './common';

export type LocationMessageRequestBody = MessageRequestBody<MessageTypesEnum.Location> & {
    [MessageTypesEnum.Location]: [LocationObject];
};

// Location Message Types
export interface LocationObject {
    address?: string;
    latitude: number;
    longitude: number;
    name?: string;
}
