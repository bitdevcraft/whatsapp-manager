import { BaseClass } from '@shared/types/base';
import { ComponentTypesEnum, InteractiveTypesEnum, MessageTypesEnum } from '@shared/types/enums';
import { GeneralRequestBody } from '@shared/types/request';

export type GeneralMessageBody = GeneralRequestBody & {
    /**
     * The Meta messaging product name.
     * @default 'whatsapp'
     */
    messaging_product: 'whatsapp';
};

export type MessageRequestBody<T extends MessageTypesEnum> = GeneralMessageBody & {
    context?: ConTextObject;
    recipient_type?: string;
    to: string;
    type?: T;
};

// Request Parameter Interfaces
export interface MessageRequestParams<T> {
    body: T;
    replyMessageId?: string;
    to: string;
}

// Response Types
export type MessagesResponse = GeneralMessageBody & {
    contacts: [
        {
            input: string;
            wa_id: string;
        },
    ];
    messages: [
        {
            id: string;
        },
    ];
};

export interface StatusObject {
    message_id: string;
    status: 'read';
    typing_indicator?: TypingIndicatorObject;
}

export interface StatusParams {
    messageId: string;
    status: string;
    typingIndicator?: {
        type: string;
    };
}

export type StatusRequestBody = GeneralMessageBody & StatusObject;

export interface TypingIndicatorObject {
    type: 'text';
}

interface ConTextObject {
    message_id: string;
}

// Messages API Class Interface - Complete definition
export declare class MessagesClass extends BaseClass {
    // Media messages
    audio(params: MessageRequestParams<import('./media').AudioMediaObject>): Promise<MessagesResponse>;

    // Contact messages
    contacts(params: MessageRequestParams<[import('./contact').ContactObject]>): Promise<MessagesResponse>;

    document(params: MessageRequestParams<import('./media').DocumentMediaObject>): Promise<MessagesResponse>;
    image(params: MessageRequestParams<import('./media').ImageMediaObject>): Promise<MessagesResponse>;
    // Interactive messages
    interactive(params: MessageRequestParams<import('./interactive').InteractiveObject>): Promise<MessagesResponse>;
    interactiveAddressMessage(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.AddressMessage;
            }
        >,
    ): Promise<MessagesResponse>;
    interactiveCtaUrl(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.CtaUrl;
            }
        >,
    ): Promise<MessagesResponse>;

    interactiveFlow(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.Flow;
            }
        >,
    ): Promise<MessagesResponse>;

    interactiveList(
        params: MessageRequestParams<import('./interactive').InteractiveObject & { type: InteractiveTypesEnum.List }>,
    ): Promise<MessagesResponse>;

    interactiveLocationRequest(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.LocationRequest;
            }
        >,
    ): Promise<MessagesResponse>;
    interactiveReplyButtons(
        params: MessageRequestParams<
            import('./interactive').InteractiveObject & {
                type: InteractiveTypesEnum.Button;
            }
        >,
    ): Promise<MessagesResponse>;
    // Location messages
    location(params: MessageRequestParams<import('./location').LocationObject>): Promise<MessagesResponse>;
    markAsRead(params: { messageId: string }): Promise<MessagesResponse>;
    // Reaction and status messages
    reaction(params: import('./reaction').ReactionParams): Promise<MessagesResponse>;
    showTypingIndicator(params: { messageId: string }): Promise<MessagesResponse>;
    status(params: StatusParams): Promise<MessagesResponse>;

    sticker(params: MessageRequestParams<import('./media').StickerMediaObject>): Promise<MessagesResponse>;
    // Template messages
    template(
        params: MessageRequestParams<import('./template').MessageTemplateObject<ComponentTypesEnum>>,
    ): Promise<MessagesResponse>;
    // Text messages
    text(params: import('./text').TextMessageParams): Promise<MessagesResponse>;
    video(params: MessageRequestParams<import('./media').VideoMediaObject>): Promise<MessagesResponse>;
}
