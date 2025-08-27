import { CategoryEnum, LanguagesEnum, TemplateStatusEnum } from '@shared/types/enums';
import { GeneralRequestBody, ResponsePagination, ResponseSuccess } from '@shared/types/request';

// Reusable carousel card types
export interface CarouselCard {
    card_index: number;
    components: ComponentTypes[];
}

export interface CatalogButton {
    action?: {
        thumbnail_product_retailer_id: string;
    };
    type: 'CATALOG';
}

export type ComponentTypes =
    | TemplateBody
    | TemplateButtons
    | TemplateCarousel
    | TemplateFooter
    | TemplateHeader
    | TemplateLimitedTimeOffer;

export interface CopyCodeButton {
    example: string; // max 15 chars
    type: 'COPY_CODE';
}

export interface FlowButton {
    flow_action?: 'data_exchange' | 'navigate';
    flow_id?: string;
    flow_json?: string;
    flow_name?: string;
    navigate_screen?: string;
    text: string; // max 25 chars
    type: 'FLOW';
}

export interface MediaCarouselCard {
    card_index: number;
    components: (TemplateBody | TemplateButtons | TemplateHeader)[];
}

export interface MPMButton {
    action?: {
        sections: {
            product_items: {
                product_retailer_id: string;
            }[];
            title?: string;
        }[];
        thumbnail_product_retailer_id: string;
    };
    type: 'MPM';
}

export interface OTPButton {
    type: 'OTP';
}

export interface PhoneNumberButton {
    phone_number: string; // max 20 chars
    text: string; // max 25 chars
    type: 'PHONE_NUMBER';
}

export interface ProductCarouselCard {
    card_index: number;
    components: TemplateHeader[];
}

export interface QuickReplyButton {
    text: string; // max 25 chars
    type: 'QUICK_REPLY';
}

export interface SPMButton {
    action?: {
        product_retailer_id: string;
    };
    type: 'SPM';
}

export interface TemplateBody {
    example?: {
        body_text?: string[][]; // For positional parameters
        body_text_named_params?: {
            example: string;
            param_name: string; // lowercase letters and underscores only
        }[]; // For named parameters
    };
    text: string; // max 1024 chars
    type: 'BODY';
}

export type TemplateButton =
    | CatalogButton
    | CopyCodeButton
    | FlowButton
    | MPMButton
    | OTPButton
    | PhoneNumberButton
    | QuickReplyButton
    | SPMButton
    | URLButton;

export interface TemplateButtons {
    buttons: TemplateButton[];
    type: 'BUTTONS';
}

export interface TemplateCarousel {
    cards: {
        card_index: number;
        components: ComponentTypes[];
    }[];
    type: 'CAROUSEL';
}

export interface TemplateDeleteParams {
    hsm_id: string;
    name: string;
}

export interface TemplateFooter {
    text: string; // max 60 chars
    type: 'FOOTER';
}

export type TemplateFormat = 'DOCUMENT' | 'IMAGE' | 'LOCATION' | 'PRODUCT' | 'TEXT' | 'VIDEO';

export interface TemplateGetParams {
    after?: string;
    before?: string;
    category?: CategoryEnum;
    language?: LanguagesEnum;
    limit?: number;
    name?: string;
    status?: TemplateStatusEnum;
}

export interface TemplateHeader {
    example?: TemplateHeaderExample;
    format: TemplateFormat;
    text?: string; // max 60 chars
    type: 'HEADER';
}

export interface TemplateHeaderExample {
    header_handle?: string[];
    header_text?: string[];
    header_text_named_params?: {
        example: string;
        param_name: string;
    }[];
}

export interface TemplateLimitedTimeOffer {
    limited_time_offer: {
        expiration_time_ms: number;
    };
    type: 'LIMITED_TIME_OFFER';
}

export type TemplateRequestBody = GeneralRequestBody & {
    category?: CategoryEnum;
    components?: ComponentTypes[];
    language: LanguagesEnum;
    name: string;
};

export interface TemplateResponse {
    category: CategoryEnum;
    components: ComponentTypes[];
    id: string;
    language: LanguagesEnum;
    name: string;
    parameter_format: 'NAMED' | 'POSITIONAL';
    status: string;
}

export interface URLButton {
    example?: string[]; // Required if url contains variable
    text: string; // max 25 chars
    type: 'URL';
    url: string; // max 2000 chars
}

export declare class TemplateClass {
    createTemplate(template: TemplateRequestBody): Promise<TemplateResponse>;
    deleteTemplate(params: TemplateDeleteParams): Promise<ResponseSuccess>;
    getTemplate(templateId: string): Promise<TemplateResponse>;
    getTemplates(params?: TemplateGetParams): Promise<ResponsePagination<TemplateResponse>>;
    updateTemplate(templateId: string, template: Partial<TemplateRequestBody>): Promise<ResponseSuccess>;
}
