import { MessageTypesEnum } from '@shared/types/enums';

import { MessageRequestBody } from './common';

// Audio Message Types
export type AudioMediaObject = HostedMediaObject | MetaMediaObject;

export type AudioMessageRequestBody = MessageRequestBody<MessageTypesEnum.Audio> & {
    [MessageTypesEnum.Audio]: [AudioMediaObject];
};

export type DocumentMediaObject = HostedDocumentMediaObject | MetaDocumentMediaObject;

export type DocumentMessageRequestBody = MessageRequestBody<MessageTypesEnum.Document> & {
    [MessageTypesEnum.Document]: [DocumentMediaObject];
};

export type ImageMediaObject = HostedImageMediaObject | MetaImageMediaObject;

export type ImageMessageRequestBody = MessageRequestBody<MessageTypesEnum.Image> & {
    [MessageTypesEnum.Image]: [ImageMediaObject];
};

// Sticker Message Types
export type StickerMediaObject = HostedMediaObject | MetaMediaObject;

export type StickerMessageRequestBody = MessageRequestBody<MessageTypesEnum.Sticker> & {
    [MessageTypesEnum.Sticker]: [StickerMediaObject];
};

export type VideoMediaObject = HostedVideoMediaObject | MetaVideoMediaObject;

export type VideoMessageRequestBody = MessageRequestBody<MessageTypesEnum.Video> & {
    [MessageTypesEnum.Video]: [VideoMediaObject];
};

type HostedDocumentMediaObject = HostedMediaObject & {
    caption?: string;
    filename?: string;
};

type HostedImageMediaObject = HostedMediaObject & {
    caption?: string;
};

interface HostedMediaObject {
    id?: never;
    link: string;
}

type HostedVideoMediaObject = HostedMediaObject & {
    caption?: string;
};

// Document Message Types
type MetaDocumentMediaObject = MetaMediaObject & {
    caption?: string;
    filename?: string;
};

// Image Message Types
type MetaImageMediaObject = MetaMediaObject & {
    caption?: string;
};

// Common media object patterns
interface MetaMediaObject {
    id: string;
    link?: never;
}

// Video Message Types
type MetaVideoMediaObject = MetaMediaObject & {
    caption?: string;
};
