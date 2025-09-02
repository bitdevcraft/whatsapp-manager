import {
    ButtonPositionEnum,
    ComponentTypesEnum,
    CurrencyCodesEnum,
    LanguagesEnum,
    MessageTypesEnum,
    ParametersTypesEnum,
    SubTypeEnum,
} from '@shared/types/enums';
import z from 'zod';

import { MessageRequestBody } from './common';

export interface MessageTemplateObject<T extends ComponentTypesEnum> {
    components?: (ButtonComponentObject | CarouselComponentObject | ComponentObject<T>)[];
    language: LanguageObject;
    name: string;
}

export type MessageTemplateRequestBody<T extends ComponentTypesEnum> = MessageRequestBody<MessageTypesEnum.Template> &
    MessageTemplateObject<T>;

type ButtonComponentObject = ComponentObject<ComponentTypesEnum.Button> & {
    index: ButtonPositionEnum;
    parameters: ParametersTypesEnum[];
    sub_type: SubTypeEnum;
};

interface CarouselComponentObject {
    cards: {
        card_index: number;
        components?: (ButtonComponentObject | ComponentObject<ComponentTypesEnum>)[];
    };
    type: ComponentTypesEnum.Carousel;
}
interface ComponentObject<T extends ComponentTypesEnum> {
    parameters: (
        | CouponCodeParametersObject
        | CurrencyParametersObject
        | DateTimeParametersObject
        | DocumentParametersObject
        | ImageParametersObject
        | TextParametersObject
        | VideoParametersObject
    )[];
    type: T;
}

type CouponCodeParametersObject = ParametersObject<ParametersTypesEnum.CouponCode> & {
    coupon_code: string;
};

interface CurrencyObject {
    amount_1000: number;
    code: CurrencyCodesEnum;
    fallback_value: string;
}

type CurrencyParametersObject = ParametersObject<ParametersTypesEnum.Currency> & {
    currency: CurrencyObject;
};

interface DateTimeObject {
    fallback_value: string;
}

type DateTimeParametersObject = ParametersObject<ParametersTypesEnum.DateTime> & {
    date_time: DateTimeObject;
};

// Import media types to avoid circular dependencies
interface DocumentMediaObject {
    caption?: string;
    filename?: string;
    id?: string;
    link?: string;
}

type DocumentParametersObject = DocumentMediaObject & ParametersObject<ParametersTypesEnum.Document>;

interface ImageMediaObject {
    caption?: string;
    id?: string;
    link?: string;
}

type ImageParametersObject = ImageMediaObject & ParametersObject<ParametersTypesEnum.Image>;

// Template Message Types
interface LanguageObject {
    code: LanguagesEnum;
    policy: 'deterministic';
}

interface ParametersObject<T extends ParametersTypesEnum> {
    type: T;
}

interface SimpleTextObject {
    parameter_name?: string;
    text: string;
}

type TextParametersObject = ParametersObject<ParametersTypesEnum.Text> & SimpleTextObject;

interface VideoMediaObject {
    caption?: string;
    id?: string;
    link?: string;
}

type VideoParametersObject = ParametersObject<ParametersTypesEnum.Video> & VideoMediaObject;

/**
 *
 */
const TextParametersObjectSchema = z.object({
    parameter_name: z.string().optional(),
    text: z.string(),
    type: z.literal('TEXT'),
});

const CouponCodeParametersObjectSchema = z.object({
    coupon_code: z.string(),
    type: z.literal('COUPON_CODE'),
});

const CurrencyParametersObjectSchema = z.object({
    currency: z.object({
        amount_1000: z.number(),
        code: z.nativeEnum(CurrencyCodesEnum),
        fallback_value: z.string(),
    }),
    type: z.literal('CURRENCY'),
});

const DateTimeParametersObjectSchema = z.object({
    date_time: z.object({
        fallback_value: z.string(),
    }),
    type: z.literal('DATE_TIME'),
});

const DocumentParametersObjectSchema = z.object({
    document: z.object({
        caption: z.string().optional(),
        filename: z.string().optional(),
        id: z.string().optional(),
        link: z.string().optional(),
    }),
    id: z.string().optional(),
    type: z.literal('DOCUMENT'),
});

const ImageParametersObjectSchema = z.object({
    image: z.object({
        caption: z.string().optional(),
        id: z.string().optional(),
        link: z.string().optional(),
    }),
    type: z.literal('IMAGE'),
});

const VideoParametersObjectSchema = z.object({
    type: z.literal('VIDEO'),
    video: z.object({
        caption: z.string().optional(),
        id: z.string().optional(),
        link: z.string().optional(),
    }),
});

// Union of all parameter schemas
export const ParameterSchema = z.union([
    TextParametersObjectSchema,
    CouponCodeParametersObjectSchema,
    CurrencyParametersObjectSchema,
    DateTimeParametersObjectSchema,
    DocumentParametersObjectSchema,
    ImageParametersObjectSchema,
    VideoParametersObjectSchema,
]);

// Component Schemas for Header, Body, Footer
const HeaderComponentSchema = z.object({
    parameters: z.array(ParameterSchema),
    type: z.literal(ComponentTypesEnum.Header),
});

const BodyComponentSchema = z.object({
    parameters: z.array(ParameterSchema),
    type: z.literal(ComponentTypesEnum.Body),
});

const FooterComponentSchema = z.object({
    parameters: z.array(ParameterSchema),
    type: z.literal(ComponentTypesEnum.Footer),
});

// Button Component Schema
const ButtonComponentSchema = z.object({
    index: z.nativeEnum(ButtonPositionEnum),
    parameters: z.array(z.nativeEnum(ParametersTypesEnum)),
    sub_type: z.nativeEnum(SubTypeEnum),
    type: z.literal(ComponentTypesEnum.Button),
});

// Union of component schemas, discriminated by 'type'
export const ComponentSchema = z.discriminatedUnion('type', [
    HeaderComponentSchema,
    BodyComponentSchema,
    FooterComponentSchema,
    ButtonComponentSchema,
]);

const LanguageObjectSchema = z.object({
    code: z.nativeEnum(LanguagesEnum),
    policy: z.literal('deterministic'),
});

export const MessageTemplateSchema = z.object({
    language: LanguageObjectSchema,
    name: z.string().min(1),
});
