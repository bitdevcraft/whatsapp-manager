import { InteractiveTypesEnum, MessageTypesEnum } from '@shared/types/enums';

import { MessageRequestBody } from './common';

export type InteractiveMessageRequestBody = MessageRequestBody<MessageTypesEnum.Interactive> & {
    [MessageTypesEnum.Interactive]: InteractiveObject;
};

export type InteractiveObject =
    | AddressMessageInteractiveObject
    | ButtonInteractiveObject
    | CtaUrlInteractiveObject
    | FlowInteractiveObject
    | ListInteractiveObject
    | LocationRequestInteractiveObject
    | ProductInteractiveObject
    | ProductListInteractiveObject;

interface ActionObject {
    buttons?: ReplyButtonObject[];
    catalog_id?: string;
    product_retailer_id?: string;
    sections?: SectionObject;
}

interface AddressMessageActionObject {
    name: 'address_message';
    parameters: AddressMessageParameters;
}

interface AddressMessageInteractiveObject {
    action: AddressMessageActionObject;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    type: InteractiveTypesEnum.AddressMessage;
}

interface AddressMessageParameters {
    country: string; // ISO country code, e.g., "IN" for India
    saved_addresses?: SavedAddress[];
    validation_errors?: ValidationErrors;
    values?: AddressValues;
}

interface AddressValues {
    address?: string;
    building_name?: string;
    city?: string;
    floor_number?: string;
    house_number?: string;
    in_pin_code?: string;
    landmark_area?: string;
    name?: string;
    phone_number?: string;
    state?: string;
    tower_number?: string;
}

interface ButtonInteractiveObject {
    action: ActionObject;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    type: InteractiveTypesEnum.Button;
}

interface ButtonObject {
    id: string;
    title: string;
}

interface CtaUrlActionObject {
    name: 'cta_url';
    parameters: CtaUrlParameters;
}

interface CtaUrlInteractiveObject {
    action: CtaUrlActionObject;
    body?: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    type: InteractiveTypesEnum.CtaUrl;
}

interface CtaUrlParameters {
    display_text: string;
    url: string;
}

// Import media types to avoid circular dependencies
interface DocumentMediaObject {
    caption?: string;
    filename?: string;
    id?: string;
    link?: string;
}

interface FlowActionObject {
    name: 'flow';
    parameters: FlowParameters;
}

interface FlowInteractiveObject {
    action: FlowActionObject;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    type: InteractiveTypesEnum.Flow;
}

interface FlowParameters {
    flow_action: 'data_exchange' | 'navigate';
    flow_action_payload?: {
        data?: Record<string, string>;
        screen?: string;
    };
    flow_cta: string;
    flow_id?: string;
    flow_message_version: string;
    flow_name?: string;
    flow_token: string;
    mode?: 'draft' | 'published';
}

interface HeaderObject {
    document?: DocumentMediaObject;
    image?: ImageMediaObject;
    text?: string;
    type: 'document' | 'image' | 'text' | 'video';
    video?: VideoMediaObject;
}

interface ImageMediaObject {
    caption?: string;
    id?: string;
    link?: string;
}

interface ListInteractiveObject {
    action: ActionObject;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    type: InteractiveTypesEnum.List;
}

interface ListSectionObject {
    product_items?: never;
    rows: RowObject[];
    title?: string;
}

interface LocationRequestActionObject {
    name: 'send_location';
}

interface LocationRequestInteractiveObject {
    action: LocationRequestActionObject;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    type: InteractiveTypesEnum.LocationRequest;
}

interface MultiProductSectionObject {
    product_items: ProductObject[];
    rows?: never;
    title?: string;
}

interface ProductInteractiveObject {
    action: ActionObject;
    body?: SimpleTextObject;
    footer?: SimpleTextObject;
    header?: HeaderObject;
    type: InteractiveTypesEnum.Product;
}

interface ProductListInteractiveObject {
    action: ActionObject;
    body: SimpleTextObject;
    footer?: SimpleTextObject;
    header: HeaderObject;
    type: InteractiveTypesEnum.ProductList;
}

// Interactive Message Types
interface ProductObject {
    product_retailer_id: string;
}

interface ReplyButtonObject {
    reply: ButtonObject;
    type: 'reply';
}

interface RowObject {
    description?: string;
    id: string;
    title: string;
}

interface SavedAddress {
    id: string;
    value: AddressValues;
}

type SectionObject = ListSectionObject | MultiProductSectionObject;

interface SimpleTextObject {
    text: string;
}

type ValidationErrors = {
    [key in keyof AddressValues]?: string;
};

interface VideoMediaObject {
    caption?: string;
    id?: string;
    link?: string;
}
