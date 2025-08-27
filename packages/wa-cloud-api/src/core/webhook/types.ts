import type { MessageTypesEnum } from '@shared/types/enums';

/**
 * Message status enum
 */
export enum MessageStatus {
    DELIVERED = 'delivered',
    READ = 'read',
    SENT = 'sent',
}

/**
 * Audio message interface
 */
export interface AudioMessage extends BaseMessage {
    audio: {
        /**
         * The ID for the audio file
         */
        id: string;
        /**
         * The MIME type of the audio file
         */
        mime_type: string;
        /**
         * Whether the audio is a voice message
         */
        voice?: boolean;
    };
    type: MessageTypesEnum.Audio;
}

/**
 * Base message interface with common properties
 */
export interface BaseMessage {
    /**
     * Context object, included when a user replies or interacts
     */
    context?: {
        /**
         * ID of the forwarded message, if applicable
         */
        forwarded?: boolean;
        /**
         * Frequently forwarded status
         */
        frequently_forwarded?: boolean;
        /**
         * ID of the sender
         */
        from?: string;
        /**
         * ID of the message
         */
        id?: string;
        /**
         * ID of the message being replied to or interacted with
         */
        message_id: string;
        /**
         * Original message information if the message was referred
         */
        referred_product?: {
            /**
             * Catalog ID
             */
            catalog_id: string;
            /**
             * Product ID
             */
            product_retailer_id: string;
        };
    };
    /**
     * Errors array, if the message had errors
     */
    errors?: {
        /**
         * Error code
         */
        code: number;
        /**
         * Error details object
         */
        error_data?: {
            /**
             * Describes the error details
             */
            details: string;
        };
        /**
         * Error message
         */
        message: string;
        /**
         * Error title
         */
        title: string;
    }[];
    from: string;
    id: string;
    timestamp: string;
    type: MessageTypesEnum;
}

/**
 * Button message interface
 */
export interface ButtonMessage extends BaseMessage {
    button: {
        /**
         * The payload for the button
         */
        payload: string;
        /**
         * Button text
         */
        text: string;
    };
    type: MessageTypesEnum.Button;
}

/**
 * Contacts message interface
 */
export interface ContactsMessage extends BaseMessage {
    contacts: {
        /**
         * The contact's addresses
         */
        addresses?: {
            city?: string;
            country?: string;
            country_code?: string;
            state?: string;
            street?: string;
            type?: string;
            zip?: string;
        }[];
        /**
         * The contact's birthday (YYYY-MM-DD format)
         */
        birthday?: string;
        /**
         * The contact's emails
         */
        emails?: {
            email: string;
            type?: string;
        }[];
        /**
         * The contact's name
         */
        name: {
            /**
             * The first name
             */
            first_name?: string;
            /**
             * The formatted name
             */
            formatted_name: string;
            /**
             * The last name
             */
            last_name?: string;
            /**
             * The middle name
             */
            middle_name?: string;
            /**
             * The prefix
             */
            prefix?: string;
            /**
             * The suffix
             */
            suffix?: string;
        };
        /**
         * The contact's organizations
         */
        org?: {
            company?: string;
            department?: string;
            title?: string;
        };
        /**
         * The contact's phone numbers
         */
        phones?: {
            phone: string;
            type?: string;
            wa_id?: string;
        }[];
        /**
         * The contact's URLs
         */
        urls?: {
            type?: string;
            url: string;
        }[];
    }[];
    type: MessageTypesEnum.Contacts;
}

/**
 * Document message interface
 */
export interface DocumentMessage extends BaseMessage {
    document: {
        /**
         * The document caption (if provided)
         */
        caption?: string;
        /**
         * The document filename
         */
        filename: string;
        /**
         * The ID for the document
         */
        id: string;
        /**
         * The MIME type of the document
         */
        mime_type: string;
        /**
         * The SHA256 hash of the document
         */
        sha256?: string;
    };
    type: MessageTypesEnum.Document;
}

/**
 * Image message interface
 */
export interface ImageMessage extends BaseMessage {
    image: {
        /**
         * The image caption (if provided)
         */
        caption?: string;
        /**
         * The ID for the image
         */
        id: string;
        /**
         * The MIME type of the image
         */
        mime_type: string;
        /**
         * The SHA256 hash of the image
         */
        sha256?: string;
    };
    type: MessageTypesEnum.Image;
}

/**
 * Interactive message interface
 */
export interface InteractiveMessage extends BaseMessage {
    interactive: {
        /**
         * ID for the button that was clicked
         */
        button_reply?: {
            id: string;
            title: string;
        };
        /**
         * ID for the list item that was selected
         */
        list_reply?: {
            description?: string;
            id: string;
            title: string;
        };
        /**
         * NFM (No-Code Flow Message) reply data
         */
        nfm_reply?: {
            /**
             * Body text of the reply
             */
            body: string;
            /**
             * Name of the flow
             */
            name: string;
            /**
             * Response data in JSON format
             */
            response_json: string;
        };
        /**
         * Type of the interactive message
         * Can be: button_reply, list_reply, flow, nfm_reply, etc.
         */
        type: string;
    };
    type: MessageTypesEnum.Interactive;
}

/**
 * Location message interface
 */
export interface LocationMessage extends BaseMessage {
    location: {
        /**
         * Address of the location
         */
        address?: string;
        /**
         * Latitude of the location
         */
        latitude: number;
        /**
         * Longitude of the location
         */
        longitude: number;
        /**
         * Name of the location
         */
        name?: string;
    };
    type: MessageTypesEnum.Location;
}

/**
 * Message handler function type
 */
export type MessageHandler = (message: WebhookMessage) => Promise<void> | void;

/**
 * Order message interface
 */
export interface OrderMessage extends BaseMessage {
    order: {
        /**
         * Catalog ID
         */
        catalog_id: string;
        /**
         * Product items in the order
         */
        product_items: {
            /**
             * Currency code
             */
            currency: string;
            /**
             * Item price
             */
            item_price: number;
            /**
             * Product ID
             */
            product_retailer_id: string;
            /**
             * Quantity of the product
             */
            quantity: number;
        }[];
        /**
         * Text message included with the order
         */
        text?: string;
    };
    type: MessageTypesEnum.Order;
}

/**
 * Reaction message interface
 */
export interface ReactionMessage extends BaseMessage {
    reaction: {
        /**
         * Emoji used for the reaction
         */
        emoji: string;
        /**
         * The ID of the message being reacted to
         */
        message_id: string;
    };
    type: MessageTypesEnum.Reaction;
}

/**
 * Sticker message interface
 */
export interface StickerMessage extends BaseMessage {
    sticker: {
        /**
         * Whether this is an animated sticker
         */
        animated: boolean;
        /**
         * The ID for the sticker
         */
        id: string;
        /**
         * The MIME type of the sticker
         */
        mime_type: string;
    };
    type: MessageTypesEnum.Sticker;
}

/**
 * System message interface
 */
export interface SystemMessage extends BaseMessage {
    system: {
        /**
         * Old and new phone numbers if the update is a phone number change
         */
        customer?: {
            /**
             * The previous phone number
             */
            previous_wa_id: string;
            /**
             * The new phone number
             */
            wa_id: string;
        };
        /**
         * User's identity if the update is a customer identity change
         */
        identity?: string;
        /**
         * The type of system update
         */
        type: string;
    };
    type: MessageTypesEnum.System;
}

/**
 * Text message interface
 */
export interface TextMessage extends BaseMessage {
    text: {
        /**
         * The text content of the message
         */
        body: string;
        preview_url?: boolean;
    };
    type: MessageTypesEnum.Text;
}

/**
 * Video message interface
 */
export interface VideoMessage extends BaseMessage {
    type: MessageTypesEnum.Video;
    video: {
        /**
         * The video caption (if provided)
         */
        caption?: string;
        /**
         * The ID for the video
         */
        id: string;
        /**
         * The MIME type of the video
         */
        mime_type: string;
        /**
         * The SHA256 hash of the video
         */
        sha256?: string;
    };
}

export interface WebhookContact {
    /**
     * Profile of Whatsapp user
     */
    profile: {
        /**
         * The display name of the contact
         */
        name: string;
    };
    /**
     *  Additional unique, alphanumeric identifier for a WhatsApp user
     */
    user_id?: string;
    /**
     * WhatsApp ID of the contact. Business can respond to this contact using this ID.
     */
    wa_id: string;
}

/**
 * Webhook event received from WhatsApp
 */
export interface WebhookEvent {
    /**
     * The field type of the event
     */
    field: string;

    /**
     * The timestamp when the event was received
     */
    timestamp: number;

    /**
     * The event data
     */
    value: any;
}

/**
 * Represents a message received through the webhook
 * Based on Meta's documentation: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#messages-object
 */
export interface WebhookMessage {
    audio?: AudioMessage['audio'];

    button?: ButtonMessage['button'];

    contacts?: ContactsMessage['contacts'];

    /**
     * The display phone number that received the message
     */
    displayPhoneNumber: string;

    document?: DocumentMessage['document'];

    /**
     * The sender's phone number
     */
    from: string;

    /**
     * The message ID
     */
    id: string;

    image?: ImageMessage['image'];

    interactive?: InteractiveMessage['interactive'];
    location?: LocationMessage['location'];
    order?: OrderMessage['order'];
    /**
     * The original message data as received from the webhook
     */
    originalData: any;
    /**
     * The phone number ID that received the message
     */
    phoneNumberId: string;
    /**
     * The profile name of the sender
     */
    profileName: string;
    reaction?: ReactionMessage['reaction'];
    statuses?: {
        /**
         * Arbitrary string included in sent message
         */
        biz_opaque_callback_data?: string;

        /**
         * Information about the conversation
         */
        conversation?: {
            /**
             * Date when the conversation expires. Only present for messages with status 'sent'
             */
            expiration_timestamp?: string;
            /**
             * Represents the ID of the conversation the given status notification belongs to
             */
            id: string;
            /**
             * Describes conversation category
             */
            origin: {
                /**
                 * Indicates conversation category. This can also be referred to as a conversation entry point
                 * - authentication: Conversation opened by business sending template categorized as AUTHENTICATION
                 * - marketing: Conversation opened by business sending template categorized as MARKETING
                 * - utility: Conversation opened by business sending template categorized as UTILITY
                 * - service: Conversation opened by business replying to customer within service window
                 * - referral_conversion: Free entry point conversation
                 */
                type: 'authentication' | 'marketing' | 'referral_conversion' | 'service' | 'utility';
            };
        };

        /**
         * Array of error objects describing the error
         */
        errors?: {
            /**
             * Error code
             */
            code: number;
            /**
             * Error details object
             */
            error_data?: {
                /**
                 * Describes the error details
                 */
                details: string;
            };
            /**
             * Error code message
             */
            message: string;
            /**
             * Error code title
             */
            title: string;
        }[];

        /**
         * The ID for the message that the business sent to a customer
         */
        id: string;

        /**
         * Pricing information for the message/conversation
         */
        pricing?: {
            /**
             * Indicates if the given message or conversation is billable
             * @deprecated This field is deprecated. Visit the WhatsApp Changelog for more information.
             */
            billable?: boolean;
            /**
             * Indicates the conversation category:
             * - authentication: Authentication conversation
             * - authentication_international: Authentication-international conversation
             * - marketing: Marketing conversation
             * - utility: Utility conversation
             * - service: Service conversation
             * - referral_conversion: Free entry point conversation
             */
            category:
                | 'authentication'
                | 'authentication_international'
                | 'marketing'
                | 'referral_conversion'
                | 'service'
                | 'utility';
            /**
             * Type of pricing model used by the business. Current supported value is CBP
             */
            pricing_model: 'CBP';
        };

        /**
         * The customer's WhatsApp ID. Business can respond to customer using this ID.
         * This ID may not match the customer's phone number.
         */
        recipient_id: string;

        /**
         * Status of the message:
         * - delivered: Message has been delivered
         * - read: Message has been read by the customer
         * - sent: Message has been sent to the customer
         */
        status: 'delivered' | 'read' | 'sent';

        /**
         * Unix timestamp for the status message
         */
        timestamp: string;
    };
    sticker?: StickerMessage['sticker'];
    system?: SystemMessage['system'];
    text?: TextMessage['text'];
    /**
     * The timestamp of the message
     */
    timestamp: string;
    /**
     * The type of message (text, image, etc.)
     */
    type: MessageTypesEnum;

    video?: VideoMessage['video'];
    /**
     * The WhatsApp Business Account ID
     */
    wabaId: string;
}

export interface WebhookMessageValue {
    contacts?: {
        profile: {
            /**
             * The display name of the whatsapp user
             */
            name: string;
        };
        /**
         * The whatsapp ID of the user
         */
        wa_id: string;
    }[];
    errors?: {
        /**
         * The error code
         */
        code: number;
        /**
         * The error data
         */
        error_data?: {
            /**
             * The error details
             */
            details: string;
        };
        /**
         * The error title
         */
        title: string;
    }[];
    messages: WhatsAppMessage[];
    /**
     * The messaging product
     */
    messaging_product: string;

    /**
     * The metadata
     */
    metadata: {
        /**
         * The display phone number of the whatsapp business account
         */
        display_phone_number: string;
        /**
         * The phone number ID of the whatsapp business account
         */
        phone_number_id: string;
    };

    statuses?: {
        /**
         * The ID of the message
         */
        id: string;
        /**
         * The recipient ID ( phone number of the user )
         */
        recipient_id: string;
        /**
         * The status of the message
         */
        status: MessageStatus;
        /**
         * The timestamp of the message
         */
        timestamp: string;
    }[];
}

/**
 * Union type for all message types
 */
export type WhatsAppMessage =
    | AudioMessage
    | ButtonMessage
    | ContactsMessage
    | DocumentMessage
    | ImageMessage
    | InteractiveMessage
    | LocationMessage
    | OrderMessage
    | ReactionMessage
    | StickerMessage
    | SystemMessage
    | TextMessage
    | VideoMessage;
