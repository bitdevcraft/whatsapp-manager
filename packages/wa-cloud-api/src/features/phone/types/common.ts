import type { Paging, ResponseSuccess } from '@shared/types/request';

export type AccountMode = 'LIVE' | 'SANDBOX';

export type CodeVerificationStatus =
    | 'BANNED'
    | 'CONNECTED'
    | 'DELETED'
    | 'DISCONNECTED'
    | 'EXPIRED'
    | 'FLAGGED'
    | 'MIGRATED'
    | 'NOT_VERIFIED'
    | 'PENDING'
    | 'RATE_LIMITED'
    | 'RESTRICTED'
    | 'UNKNOWN'
    | 'UNVERIFIED'
    | 'VERIFIED';

export interface Cursors {
    after: string;
    before: string;
}

export interface HealthStatus {
    can_send_message: string;
    entities: HealthStatusEntity[];
}

export interface HealthStatusEntity {
    additional_info?: string[];
    can_send_message: string;
    entity_type: string;
    errors?: {
        error_code: number;
        error_description: string;
        possible_solution: string;
    }[];
    id: string;
}

export type MessagingLimitTier = 'TIER_1K' | 'TIER_10K' | 'TIER_50' | 'TIER_100K' | 'TIER_250' | 'TIER_UNLIMITED';

export interface PhoneNumberClass {
    getPhoneNumberById(fields?: string): Promise<PhoneNumberResponse>;
    getPhoneNumbers(): Promise<PhoneNumbersResponse>;
    requestVerificationCode(params: RequestVerificationCodeRequest): Promise<ResponseSuccess>;
    verifyCode(params: VerifyCodeRequest): Promise<ResponseSuccess>;
}

export interface PhoneNumberResponse {
    account_mode?: AccountMode;
    certificate?: string;
    code_verification_status?: CodeVerificationStatus;
    conversational_automation?: Record<string, unknown>;
    display_phone_number: string;
    eligibility_for_api_business_global_search?: string;
    health_status?: HealthStatus;
    id: string;
    is_official_business_account?: boolean;
    is_on_biz_app?: boolean;
    is_pin_enabled?: boolean;
    is_preverified_number?: boolean;
    last_onboarded_time?: string;
    messaging_limit_tier?: MessagingLimitTier;
    name_status?: string;
    new_certificate?: string;
    new_name_status?: string;
    platform_type?: PlatformType;
    quality_rating: QualityRating;
    quality_score?: QualityScore;
    search_visibility?: string;
    status?: CodeVerificationStatus;
    throughput?: Throughput;
    verified_name: string;
}

export interface PhoneNumbersResponse {
    data: PhoneNumberResponse[];
    paging: Paging;
}

export type PlatformType = 'CLOUD_API' | 'NOT_APPLICABLE' | 'ON_PREMISE';

export type QualityRating = 'GREEN' | 'NA' | 'RED' | 'YELLOW';

export interface QualityScore {
    score: QualityRating;
}

export interface RequestVerificationCodeRequest {
    code_method: 'SMS' | 'VOICE';
    language: string;
}

export interface Throughput {
    level: ThroughputLevel;
}

export type ThroughputLevel = 'HIGH' | 'NOT_APPLICABLE' | 'STANDARD';

export interface TwoStepVerificationParams {
    pin: string;
}

export interface VerifyCodeRequest {
    code: string;
}
