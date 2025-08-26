import { CategoryEnum, CurrencyCodesEnum, LanguagesEnum } from '@shared/types/enums';

import type { TemplateFormat } from './common';

export interface AuthenticationTemplateOptions {
    add_security_recommendation?: boolean;
    code_expiration_minutes?: number;
    copy_code_button?: boolean;
    language: LanguagesEnum;
    name: string;
}

// Body factory options
export interface BodyOptions {
    example?: {
        body_text?: string[][];
        body_text_named_params?: {
            example: string;
            param_name: string;
        }[];
    };
    parameters?: TemplateParameter[];
    text: string;
}

// Button factory options
export interface ButtonOptions {
    copy_code?: {
        example: string;
    };
    flow?: {
        flow_action?: 'data_exchange' | 'navigate';
        flow_id?: string;
        flow_json?: string;
        flow_name?: string;
        navigate_screen?: string;
        text: string;
    };
    mpm?: boolean;
    otp?: boolean;
    phone_number?: {
        phone_number: string;
        text: string;
    };
    quick_reply?: {
        text: string;
    }[];
    spm?: boolean;
    url?: {
        example?: string;
        text: string;
        url: string;
    };
}

// Carousel options
export interface CarouselCard {
    body?: string;
    bodyParameters?: TemplateParameter[];
    buttons?: ButtonOptions;
    image?: string; // Image handle
    product?: string; // Product retailer ID
    video?: string; // Video handle
}

export interface CarouselOptions {
    cards: CarouselCard[];
}

export interface CatalogTemplateOptions {
    body: BodyOptions;
    footer?: FooterOptions;
    header?: Omit<HeaderOptions, 'format'>;
    language: LanguagesEnum;
    name: string;
    thumbnail_product_retailer_id: string;
}

export interface CouponTemplateOptions {
    body: BodyOptions;
    coupon_code: string;
    footer?: FooterOptions;
    header?: Omit<HeaderOptions, 'format'>;
    language: LanguagesEnum;
    name: string;
}

export interface CurrencyParameter {
    amount_1000: number; // Amount multiplied by 1000
    code: CurrencyCodesEnum;
    fallback_value: string;
    type: 'currency';
}

export interface DateTimeParameter {
    fallback_value: string;
    type: 'date_time';
}

// Footer factory options
export interface FooterOptions {
    text: string;
}

// Header factory options
export interface HeaderOptions {
    example?: {
        header_handle?: string[];
        header_text?: string[];
        header_text_named_params?: {
            example: string;
            param_name: string;
        }[];
    };
    format: TemplateFormat;
    parameters?: TemplateParameter[];
    text?: string;
}

// Limited Time Offer options
export interface LimitedTimeOfferOptions {
    expiration_time_ms: number;
}

export interface LimitedTimeOfferTemplateOptions {
    body: BodyOptions;
    expiration_time_ms: number;
    footer?: FooterOptions;
    header?: Omit<HeaderOptions, 'format'>;
    language: LanguagesEnum;
    name: string;
}

export interface LocationParameter {
    address?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    type: 'location';
}

export interface MediaCardCarouselTemplateOptions {
    cards: {
        body: BodyOptions;
        buttons?: ButtonOptions;
        header: {
            example: {
                header_handle: string[];
            };
            format: 'IMAGE' | 'VIDEO';
        };
    }[];
    language: LanguagesEnum;
    name: string;
}

export interface MediaParameter {
    handle?: string; // Media handle from Resumable Upload API
    link?: string; // Media URL
    type: 'document' | 'image' | 'video';
}

export interface MPMTemplateOptions {
    body: BodyOptions;
    footer?: FooterOptions;
    header?: Omit<HeaderOptions, 'format'>;
    language: LanguagesEnum;
    name: string;
    sections: ProductSection[];
    thumbnail_product_retailer_id: string;
}

// Specific template type options
export interface OTPTemplateOptions {
    add_security_recommendation?: boolean;
    code_expiration_minutes?: number;
    language: LanguagesEnum;
    name: string;
}

export interface ProductCardCarouselTemplateOptions {
    body: BodyOptions;
    cards: {
        product_retailer_id: string;
    }[];
    footer?: FooterOptions;
    header?: Omit<HeaderOptions, 'format'>;
    language: LanguagesEnum;
    name: string;
}

export interface ProductParameter {
    product_retailer_id: string;
    type: 'product';
}

// Product section for MPM
export interface ProductSection {
    product_items: {
        product_retailer_id: string;
    }[];
    title?: string;
}

export interface SPMTemplateOptions {
    body: BodyOptions;
    footer?: FooterOptions;
    header?: Omit<HeaderOptions, 'format'>;
    language: LanguagesEnum;
    name: string;
    product_retailer_id: string;
}

// Template creation options
export interface TemplateOptions {
    body?: BodyOptions;
    buttons?: ButtonOptions;
    carousel?: CarouselOptions;
    category: CategoryEnum;
    footer?: FooterOptions;
    header?: HeaderOptions;
    language: LanguagesEnum;
    limitedTimeOffer?: LimitedTimeOfferOptions;
    name: string;
}

export type TemplateParameter =
    | CurrencyParameter
    | DateTimeParameter
    | LocationParameter
    | MediaParameter
    | ProductParameter
    | TextParameter;

// Parameter types for template factory functions
export interface TextParameter {
    type: 'text';
    value: string;
}
