import { CategoryEnum } from '@shared/types/enums';

import type {
    ComponentTypes,
    MediaCarouselCard,
    ProductCarouselCard,
    TemplateBody,
    TemplateButton,
    TemplateButtons,
    TemplateFooter,
    TemplateHeader,
    TemplateRequestBody,
} from '../types/common';
import type {
    AuthenticationTemplateOptions,
    BodyOptions,
    ButtonOptions,
    CatalogTemplateOptions,
    CouponTemplateOptions,
    FooterOptions,
    HeaderOptions,
    LimitedTimeOfferTemplateOptions,
    MediaCardCarouselTemplateOptions,
    MPMTemplateOptions,
    OTPTemplateOptions,
    ProductCardCarouselTemplateOptions,
    SPMTemplateOptions,
    TemplateOptions,
    TemplateParameter,
} from '../types/factory';

// Authentication Template Factory
export function createAuthenticationTemplate(options: AuthenticationTemplateOptions): TemplateRequestBody {
    const components: ComponentTypes[] = [];

    // Add security message
    let bodyText = 'Your security code is *{{1}}*.';
    if (options.add_security_recommendation) {
        bodyText += ' Do not share this code with anyone.';
    }
    if (options.code_expiration_minutes) {
        bodyText += ` This code expires in ${options.code_expiration_minutes} minutes.`;
    }

    components.push({
        example: {
            body_text: [['ABCD1234']], // Example auth code
        },
        text: bodyText,
        type: 'BODY',
    });

    // Add copy code button if requested
    if (options.copy_code_button) {
        components.push({
            buttons: [
                {
                    example: 'ABCD1234',
                    type: 'COPY_CODE',
                },
            ],
            type: 'BUTTONS',
        });
    }

    return {
        category: CategoryEnum.Authentication,
        components,
        language: options.language,
        name: options.name,
    };
}

// Catalog Template Factory
export function createCatalogTemplate(options: CatalogTemplateOptions): TemplateRequestBody {
    const components: ComponentTypes[] = [];

    if (options.header) {
        components.push(createHeader({ ...options.header, format: 'TEXT' }));
    }

    components.push(createBody(options.body));

    if (options.footer) {
        components.push(createFooter(options.footer));
    }

    // Add catalog button
    components.push({
        buttons: [
            {
                action: {
                    thumbnail_product_retailer_id: options.thumbnail_product_retailer_id,
                },
                type: 'CATALOG',
            },
        ],
        type: 'BUTTONS',
    });

    return {
        category: CategoryEnum.Marketing,
        components,
        language: options.language,
        name: options.name,
    };
}

// Coupon Template Factory
export function createCouponTemplate(options: CouponTemplateOptions): TemplateRequestBody {
    const components: ComponentTypes[] = [];

    if (options.header) {
        components.push(createHeader({ ...options.header, format: 'TEXT' }));
    }

    components.push(createBody(options.body));

    if (options.footer) {
        components.push(createFooter(options.footer));
    }

    // Add copy code button
    components.push({
        buttons: [
            {
                example: options.coupon_code,
                type: 'COPY_CODE',
            },
        ],
        type: 'BUTTONS',
    });

    return {
        category: CategoryEnum.Marketing,
        components,
        language: options.language,
        name: options.name,
    };
}

// Limited Time Offer Template Factory
export function createLimitedTimeOfferTemplate(options: LimitedTimeOfferTemplateOptions): TemplateRequestBody {
    const components: ComponentTypes[] = [];

    // Add limited time offer component first
    components.push({
        limited_time_offer: {
            expiration_time_ms: options.expiration_time_ms,
        },
        type: 'LIMITED_TIME_OFFER',
    });

    if (options.header) {
        components.push(createHeader({ ...options.header, format: 'TEXT' }));
    }

    components.push(createBody(options.body));

    if (options.footer) {
        components.push(createFooter(options.footer));
    }

    return {
        category: CategoryEnum.Marketing,
        components,
        language: options.language,
        name: options.name,
    };
}

// Media Card Carousel Template Factory
export function createMediaCardCarouselTemplate(options: MediaCardCarouselTemplateOptions): TemplateRequestBody {
    const components: ComponentTypes[] = [];

    // Add carousel component
    const carouselCards: MediaCarouselCard[] = [];
    options.cards.forEach((card, index) => {
        const cardComponents: (TemplateBody | TemplateButtons | TemplateHeader)[] = [];

        // Add header (media)
        cardComponents.push({
            example: card.header.example,
            format: card.header.format,
            type: 'HEADER' as const,
        });

        // Add body
        cardComponents.push(createBody(card.body));

        // Add buttons if any
        if (card.buttons) {
            cardComponents.push(...(createButtons(card.buttons) as TemplateButtons[]));
        }

        carouselCards.push({
            card_index: index,
            components: cardComponents,
        });
    });

    components.push({
        cards: carouselCards,
        type: 'CAROUSEL',
    });

    return {
        category: CategoryEnum.Marketing,
        components,
        language: options.language,
        name: options.name,
    };
}

// MPM (Multi-Product Message) Template Factory
export function createMPMTemplate(options: MPMTemplateOptions): TemplateRequestBody {
    const components: ComponentTypes[] = [];

    if (options.header) {
        components.push(createHeader({ ...options.header, format: 'TEXT' }));
    }

    components.push(createBody(options.body));

    if (options.footer) {
        components.push(createFooter(options.footer));
    }

    // Add MPM button
    components.push({
        buttons: [
            {
                action: {
                    sections: options.sections,
                    thumbnail_product_retailer_id: options.thumbnail_product_retailer_id,
                },
                type: 'MPM',
            },
        ],
        type: 'BUTTONS',
    });

    return {
        category: CategoryEnum.Marketing,
        components,
        language: options.language,
        name: options.name,
    };
}

// OTP Template Factory
export function createOTPTemplate(options: OTPTemplateOptions): TemplateRequestBody {
    const components: ComponentTypes[] = [];

    // Add security recommendation if requested
    let bodyText = '*{{1}}* is your verification code.';
    if (options.add_security_recommendation) {
        bodyText += ' For your security, do not share this code.';
    }
    if (options.code_expiration_minutes) {
        bodyText += ` This code expires in ${options.code_expiration_minutes} minutes.`;
    }

    components.push({
        example: {
            body_text: [['123456']], // Example OTP code
        },
        text: bodyText,
        type: 'BODY',
    });

    // Add OTP button
    components.push({
        buttons: [{ type: 'OTP' }],
        type: 'BUTTONS',
    });

    return {
        category: CategoryEnum.Authentication,
        components,
        language: options.language,
        name: options.name,
    };
}

// Product Card Carousel Template Factory
export function createProductCardCarouselTemplate(options: ProductCardCarouselTemplateOptions): TemplateRequestBody {
    const components: ComponentTypes[] = [];

    if (options.header) {
        components.push(createHeader({ ...options.header, format: 'TEXT' }));
    }

    components.push(createBody(options.body));

    if (options.footer) {
        components.push(createFooter(options.footer));
    }

    // Add carousel with product cards
    const carouselCards: ProductCarouselCard[] = options.cards.map((card, index) => ({
        card_index: index,
        components: [
            {
                example: {
                    header_handle: [card.product_retailer_id],
                },
                format: 'PRODUCT' as const,
                type: 'HEADER' as const,
            },
        ],
    }));

    components.push({
        cards: carouselCards,
        type: 'CAROUSEL',
    });

    return {
        category: CategoryEnum.Marketing,
        components,
        language: options.language,
        name: options.name,
    };
}

// SPM (Single-Product Message) Template Factory
export function createSPMTemplate(options: SPMTemplateOptions): TemplateRequestBody {
    const components: ComponentTypes[] = [];

    if (options.header) {
        components.push(createHeader({ ...options.header, format: 'TEXT' }));
    }

    components.push(createBody(options.body));

    if (options.footer) {
        components.push(createFooter(options.footer));
    }

    // Add SPM button
    components.push({
        buttons: [
            {
                action: {
                    product_retailer_id: options.product_retailer_id,
                },
                type: 'SPM',
            },
        ],
        type: 'BUTTONS',
    });

    return {
        category: CategoryEnum.Marketing,
        components,
        language: options.language,
        name: options.name,
    };
}

// Generic template factory
export function createTemplate(options: TemplateOptions): TemplateRequestBody {
    const components: ComponentTypes[] = [];

    if (options.header) {
        components.push(createHeader(options.header));
    }

    if (options.body) {
        components.push(createBody(options.body));
    }

    if (options.footer) {
        components.push(createFooter(options.footer));
    }

    if (options.buttons) {
        components.push(...createButtons(options.buttons));
    }

    if (options.carousel) {
        // Handle carousel components
        const carouselComponents: ComponentTypes[] = [];
        options.carousel.cards.forEach((card, index) => {
            if (card.image || card.video || card.product) {
                const format = card.image ? 'IMAGE' : card.video ? 'VIDEO' : 'DOCUMENT';
                const handle = card.image || card.video || card.product || '';
                carouselComponents.push({
                    example: {
                        header_handle: [handle],
                    },
                    format: format,
                    type: 'HEADER',
                });
            }
            if (card.body) {
                carouselComponents.push({
                    example: card.bodyParameters
                        ? {
                              body_text: [formatParameterExamples(card.bodyParameters)],
                          }
                        : undefined,
                    text: card.body,
                    type: 'BODY',
                });
            }
            if (card.buttons) {
                carouselComponents.push(...createButtons(card.buttons));
            }
        });
        components.push(...carouselComponents);
    }

    if (options.limitedTimeOffer) {
        components.push({
            limited_time_offer: {
                expiration_time_ms: options.limitedTimeOffer.expiration_time_ms,
            },
            type: 'LIMITED_TIME_OFFER',
        });
    }

    return {
        category: options.category,
        components: components.length > 0 ? components : undefined,
        language: options.language,
        name: options.name,
    };
}

// Helper function to create body component
function createBody(options: BodyOptions): TemplateBody {
    const body: TemplateBody = {
        text: options.text,
        type: 'BODY',
    };

    if (options.example) {
        body.example = options.example;
    }

    return body;
}

// Helper function to create buttons
function createButtons(options: ButtonOptions): ComponentTypes[] {
    const buttons: TemplateButton[] = [];

    if (options.phone_number) {
        buttons.push({
            phone_number: options.phone_number.phone_number,
            text: options.phone_number.text,
            type: 'PHONE_NUMBER',
        });
    }

    if (options.url) {
        const urlButton: any = {
            text: options.url.text,
            type: 'URL',
            url: options.url.url,
        };
        if (options.url.example) {
            urlButton.example = [options.url.example];
        }
        buttons.push(urlButton);
    }

    if (options.quick_reply) {
        options.quick_reply.forEach((qr) => {
            buttons.push({
                text: qr.text,
                type: 'QUICK_REPLY',
            });
        });
    }

    if (options.copy_code) {
        buttons.push({
            example: options.copy_code.example,
            type: 'COPY_CODE',
        });
    }

    if (options.flow) {
        const flowButton: any = {
            text: options.flow.text,
            type: 'FLOW',
        };
        if (options.flow.flow_id) flowButton.flow_id = options.flow.flow_id;
        if (options.flow.flow_name) flowButton.flow_name = options.flow.flow_name;
        if (options.flow.flow_json) flowButton.flow_json = options.flow.flow_json;
        if (options.flow.flow_action) flowButton.flow_action = options.flow.flow_action;
        if (options.flow.navigate_screen) flowButton.navigate_screen = options.flow.navigate_screen;
        buttons.push(flowButton);
    }

    if (options.mpm) {
        buttons.push({ type: 'MPM' });
    }

    if (options.otp) {
        buttons.push({ type: 'OTP' });
    }

    if (options.spm) {
        buttons.push({ type: 'SPM' });
    }

    return buttons.length > 0
        ? [
              {
                  buttons: buttons,
                  type: 'BUTTONS',
              },
          ]
        : [];
}

// Helper function to create footer component
function createFooter(options: FooterOptions): TemplateFooter {
    return {
        text: options.text,
        type: 'FOOTER',
    };
}

// Helper function to create header component
function createHeader(options: HeaderOptions): TemplateHeader {
    const header: TemplateHeader = {
        format: options.format,
        type: 'HEADER',
    };

    if (options.text) {
        header.text = options.text;
    }

    if (options.example) {
        header.example = options.example;
    }

    return header;
}

// Helper function to format parameter examples
function formatParameterExamples(parameters: TemplateParameter[]): string[] {
    return parameters.map((param) => {
        switch (param.type) {
            case 'currency':
                return param.fallback_value;
            case 'date_time':
                return param.fallback_value;
            case 'document':
            case 'image':
            case 'video':
                return param.handle || param.link || '';
            case 'location':
                return param.name || '';
            case 'product':
                return param.product_retailer_id;
            case 'text':
                return param.value;
            default:
                return '';
        }
    });
}
