import {
    ButtonPositionEnum,
    ComponentTypesEnum,
    CurrencyCodesEnum,
    LanguagesEnum,
    MessageTypesEnum,
    ParametersTypesEnum,
    SubTypeEnum,
} from '@shared/types/enums';
import { MessageRequestBody } from './common';
import z from 'zod';

// Template Message Types
type LanguageObject = {
    policy: 'deterministic';
    code: LanguagesEnum;
};

type ParametersObject<T extends ParametersTypesEnum> = {
    type: T;
};

type SimpleTextObject = {
    text: string;
    parameter_name?: string;
};

type TextParametersObject = ParametersObject<ParametersTypesEnum.Text> & SimpleTextObject;
type CouponCodeParametersObject = ParametersObject<ParametersTypesEnum.CouponCode> & {
    coupon_code: string;
};

type CurrencyObject = {
    fallback_value: string;
    code: CurrencyCodesEnum;
    amount_1000: number;
};

type CurrencyParametersObject = ParametersObject<ParametersTypesEnum.Currency> & {
    currency: CurrencyObject;
};

type DateTimeObject = {
    fallback_value: string;
};

type DateTimeParametersObject = ParametersObject<ParametersTypesEnum.DateTime> & {
    date_time: DateTimeObject;
};

// Import media types to avoid circular dependencies
type DocumentMediaObject = {
    id?: string;
    link?: string;
    caption?: string;
    filename?: string;
};

type ImageMediaObject = {
    id?: string;
    link?: string;
    caption?: string;
};

type VideoMediaObject = {
    id?: string;
    link?: string;
    caption?: string;
};

type DocumentParametersObject = ParametersObject<ParametersTypesEnum.Document> & DocumentMediaObject;

type ImageParametersObject = ParametersObject<ParametersTypesEnum.Image> & ImageMediaObject;

type VideoParametersObject = ParametersObject<ParametersTypesEnum.Video> & VideoMediaObject;

type ComponentObject<T extends ComponentTypesEnum> = {
    type: T;
    parameters: (
        | CurrencyParametersObject
        | DateTimeParametersObject
        | DocumentParametersObject
        | ImageParametersObject
        | TextParametersObject
        | VideoParametersObject
        | CouponCodeParametersObject
    )[];
};

type ButtonComponentObject = ComponentObject<ComponentTypesEnum.Button> & {
    parameters: Array<ParametersTypesEnum>;
    sub_type: SubTypeEnum;
    index: ButtonPositionEnum;
};

type CarouselComponentObject = {
    type: ComponentTypesEnum.Carousel;
    cards: {
        card_index: number;
        components?: (ComponentObject<ComponentTypesEnum> | ButtonComponentObject)[];
    };
};

export type MessageTemplateObject<T extends ComponentTypesEnum> = {
    name: string;
    language: LanguageObject;
    components?: (ComponentObject<T> | ButtonComponentObject | CarouselComponentObject)[];
};

export type MessageTemplateRequestBody<T extends ComponentTypesEnum> = MessageRequestBody<MessageTypesEnum.Template> &
    MessageTemplateObject<T>;

/**
 *
 */
const TextParametersObjectSchema = z.object({
    type: z.literal('TEXT'),
    text: z.string(),
    parameter_name: z.string().optional(),
});

const CouponCodeParametersObjectSchema = z.object({
    type: z.literal('COUPON_CODE'),
    coupon_code: z.string(),
});

const CurrencyParametersObjectSchema = z.object({
    type: z.literal('CURRENCY'),
    currency: z.object({
        amount_1000: z.number(),
        code: z.nativeEnum(CurrencyCodesEnum),
        fallback_value: z.string(),
    }),
});

const DateTimeParametersObjectSchema = z.object({
    type: z.literal('DATE_TIME'),
    date_time: z.object({
        fallback_value: z.string(),
    }),
});

const DocumentParametersObjectSchema = z.object({
    type: z.literal('DOCUMENT'),
    id: z.string().optional(),
    document: z.object({
        id: z.string().optional(),
        link: z.string().optional(),
        caption: z.string().optional(),
        filename: z.string().optional(),
    }),
});

const ImageParametersObjectSchema = z.object({
    type: z.literal('IMAGE'),
    image: z.object({
        id: z.string().optional(),
        link: z.string().optional(),
        caption: z.string().optional(),
    }),
});

const VideoParametersObjectSchema = z.object({
    type: z.literal('VIDEO'),
    video: z.object({
        id: z.string().optional(),
        link: z.string().optional(),
        caption: z.string().optional(),
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
    type: z.literal(ComponentTypesEnum.Header),
    parameters: z.array(ParameterSchema),
});

const BodyComponentSchema = z.object({
    type: z.literal(ComponentTypesEnum.Body),
    parameters: z.array(ParameterSchema),
});

const FooterComponentSchema = z.object({
    type: z.literal(ComponentTypesEnum.Footer),
    parameters: z.array(ParameterSchema),
});

// Button Component Schema
const ButtonComponentSchema = z.object({
    type: z.literal(ComponentTypesEnum.Button),
    parameters: z.array(z.nativeEnum(ParametersTypesEnum)),
    sub_type: z.nativeEnum(SubTypeEnum),
    index: z.nativeEnum(ButtonPositionEnum),
});

// Union of component schemas, discriminated by 'type'
export const ComponentSchema = z.discriminatedUnion('type', [
    HeaderComponentSchema,
    BodyComponentSchema,
    FooterComponentSchema,
    ButtonComponentSchema,
]);

const LanguageObjectSchema = z.object({
    policy: z.literal('deterministic'),
    code: z.nativeEnum(LanguagesEnum),
});

export const MessageTemplateSchema = z.object({
    name: z.string().min(1),
    language: LanguageObjectSchema,
});
