import type { ResponseSuccess } from '@shared/types/request';

/**
 * WABA account review status enumeration
 */
export enum WabaAccountReviewStatus {
    Active = 'ACTIVE',
    Approved = 'APPROVED',
    Disabled = 'DISABLED',
    Inactive = 'INACTIVE',
}

/**
 * WABA account status enumeration
 */
export enum WabaAccountStatus {
    Active = 'ACTIVE',
    Approved = 'APPROVED',
    Disabled = 'DISABLED',
    Inactive = 'INACTIVE',
}

/**
 * Business verification status enumeration
 */
export enum WabaBusinessVerificationStatus {
    PendingSubmission = 'pending_submission',
    Rejected = 'rejected',
    Unverified = 'unverified',
    Verified = 'verified',
}

/**
 * WABA health status for message sending capability
 */
export enum WabaHealthStatusCanSendMessage {
    Available = 'AVAILABLE',
    Blocked = 'BLOCKED',
    Limited = 'LIMITED',
}

/**
 * Parameters for updating WABA subscription
 */
export interface UpdateWabaSubscription {
    override_callback_uri: string;
    verify_token: string;
}

/**
 * WhatsApp Business Account information
 */
export interface WabaAccount {
    account_review_status?: WabaAccountReviewStatus;
    business_verification_status?: WabaBusinessVerificationStatus;
    currency?: string;
    health_status?: WabaHealthStatus;
    id?: string;
    message_template_namespace?: string;
    name?: string;
    on_behalf_of_business_info?: WabaOnBehalfOfBusinessInfo;
    owner_business_info?: WabaOwnerBusinessInfo;
    ownership_type?: string;
    primary_funding_id?: string;
    status?: WabaAccountStatus;
    timezone_id?: string;
}

/**
 * Available fields for WABA account queries
 */
export type WabaAccountFields =
    | 'account_review_status'
    | 'auth_international_rate_eligibility'
    | 'business_verification_status'
    | 'country'
    | 'currency'
    | 'health_status'
    | 'id'
    | 'message_template_namespace'
    | 'name'
    | 'owner_business_info'
    | 'ownership_type'
    | 'primary_funding_id'
    | 'status'
    | 'timezone_id';

/**
 * Parameter type for specifying which WABA account fields to retrieve
 */
export type WabaAccountFieldsParam = WabaAccountFields[];

/**
 * Interface defining all WABA API methods
 */
export interface WABAClass {
    getAllWabaSubscriptions(): Promise<WabaSubscriptions>;
    getWabaAccount(fields?: WabaAccountFieldsParam): Promise<WabaAccount>;
    unsubscribeFromWaba(): Promise<ResponseSuccess>;
    updateWabaSubscription(params: UpdateWabaSubscription): Promise<ResponseSuccess>;
}

/**
 * Overall WABA health status
 */
export interface WabaHealthStatus {
    can_send_message?: WabaHealthStatusCanSendMessage;
    entities?: WabaHealthStatusEntity[];
}

/**
 * WABA health status entity information
 */
export interface WabaHealthStatusEntity {
    can_send_message?: string;
    entity_type?: string;
    errors?: WabaHealthStatusError[];
    id?: string;
}

/**
 * WABA health status error details
 */
export interface WabaHealthStatusError {
    error_code?: number;
    error_description?: string;
    possible_solution?: string;
}

/**
 * Information about On Behalf Of relationships this account is part of.
 */
export interface WabaOnBehalfOfBusinessInfo {
    id: string;
    name: string;
    status: string;
    type: string;
}

/**
 * Get the ID for the business that owns this WABA. Use this field to fetch a client's business ID.
 */
export interface WabaOwnerBusinessInfo {
    id: string;
    name: string;
}

/**
 * WhatsApp Business Account subscription configuration
 */
export interface WabaSubscription {
    override_callback_uri?: string;
    whatsapp_business_api_data: {
        category: string;
        id: string;
        link: string;
        name: string;
    };
}

/**
 * Response containing all WABA subscriptions
 */
export interface WabaSubscriptions {
    data: WabaSubscription[];
}
