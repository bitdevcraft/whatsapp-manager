import { ResponseSuccess } from '@shared/types';
import { IncomingHttpHeaders, IncomingMessage } from 'http';

export enum FlowActionEnum {
    BACK = 'BACK',
    DATA_EXCHANGE = 'data_exchange',
    INIT = 'INIT',
}

/**
 * Enum for Flow Categories
 */
export enum FlowCategoryEnum {
    AppointmentBooking = 'APPOINTMENT_BOOKING',
    ContactUs = 'CONTACT_US',
    CustomerSupport = 'CUSTOMER_SUPPORT',
    LeadGeneration = 'LEAD_GENERATION',
    Other = 'OTHER',
    SignIn = 'SIGN_IN',
    SignUp = 'SIGN_UP',
    Survey = 'SURVEY',
}

/**
 * Enum for Flow Status
 */
export enum FlowStatusEnum {
    Blocked = 'BLOCKED',
    Deprecated = 'DEPRECATED',
    Draft = 'DRAFT',
    Published = 'PUBLISHED',
    Throttled = 'THROTTLED',
}

/**
 * Enum for Flow Types in webhook handlers
 * Used to register handlers for specific flow events
 */
export enum FlowTypeEnum {
    /** Match all flow action types */
    All = '*',
    /** Data exchange requests */
    Change = 'data_exchange',
    /** Error notification requests */
    Error = 'error',
    /** Health check/ping requests */
    Ping = 'ping',
}

/**
 * Create Flow Response
 */
export interface CreateFlowResponse {
    id: string;
    success: boolean;
    validation_errors?: FlowValidationError[];
}

/**
 * Flow Item
 */
export interface Flow {
    categories: FlowCategoryEnum[];
    id: string;
    name: string;
    status: FlowStatusEnum;
    validation_errors: FlowValidationError[];
}

/**
 * Flow Asset
 */
export interface FlowAsset {
    asset_type: string;
    download_url: string;
    name: string;
}

/**
 * Flow Assets Response
 */
export interface FlowAssetsResponse {
    data: FlowAsset[];
    paging: Pagination;
}

export interface FlowClass {
    /**
     * Create Flow
     *
     * @param wabaId - The WABA ID
     * @param data - The flow data including name, categories, endpoint_uri, and optional clone_flow_id
     * @returns Promise with the created flow ID
     */
    createFlow(
        wabaId: string,
        data: {
            categories?: FlowCategoryEnum[];
            clone_flow_id?: string;
            endpoint_uri?: string;
            flow_json?: string;
            name: string;
            publish?: boolean;
        },
    ): Promise<CreateFlowResponse>;

    /**
     * Delete Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    deleteFlow(flowId: string): Promise<ResponseSuccess>;

    /**
     * Deprecate Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    deprecateFlow(flowId: string): Promise<ResponseSuccess>;

    /**
     * Get Flow
     *
     * @param flowId - The flow ID
     * @param fields - Optional fields to return
     * @param dateFormat - Optional date format
     * @returns Promise with the flow details
     */
    getFlow(flowId: string, fields?: string, dateFormat?: string): Promise<Flow | FlowPreviewResponse>;

    /**
     * List Assets (Get Flow JSON URL)
     *
     * @param flowId - The flow ID
     * @returns Promise with the list of assets
     */
    listAssets(flowId: string): Promise<FlowAssetsResponse>;

    /**
     * List Flows
     *
     * @param wabaId - The WABA ID
     * @returns Promise with the list of flows
     */
    listFlows(wabaId: string): Promise<FlowsListResponse>;

    /**
     * Migrate Flows
     *
     * @param wabaId - The destination WABA ID
     * @param data - The migration data including source_waba_id and optional source_flow_names
     * @returns Promise with migration results
     */
    migrateFlows(
        wabaId: string,
        data: {
            source_flow_names?: string[];
            source_waba_id: string;
        },
    ): Promise<FlowMigrationResponse>;

    /**
     * Publish Flow
     *
     * @param flowId - The flow ID
     * @returns Promise with the success status
     */
    publishFlow(flowId: string): Promise<ResponseSuccess>;

    /**
     * Update Flow JSON
     *
     * @param flowId - The flow ID
     * @param data - The asset data including asset_type, file, and name
     * @returns Promise with the success status and validation errors
     */
    updateFlowJson(
        flowId: string,
        data: {
            file: Blob | Buffer | object;
            name?: string;
        },
    ): Promise<UpdateFlowResponse>;

    /**
     * Update Flow Metadata
     *
     * @param flowId - The flow ID
     * @param data - The flow metadata to update
     * @returns Promise with the success status
     */
    updateFlowMetadata(
        flowId: string,
        data: {
            application_id?: string;
            categories?: FlowCategoryEnum[];
            endpoint_uri?: string;
            name?: string;
        },
    ): Promise<ResponseSuccess>;

    /**
     * Validate Flow JSON by attempting an update without publishing.
     * This is a convenience method; the API doesn't have a dedicated validation endpoint.
     *
     * @param flowId - The ID of the Flow (must exist, can be in DRAFT status).
     * @param flowJsonData - The Flow JSON content as a Buffer, JSON object, or Blob.
     * @returns Promise indicating if the JSON is valid and includes validation errors if any.
     */
    validateFlowJson(flowId: string, flowJsonData: Blob | Buffer | object): Promise<ValidateFlowJsonResponse>;
}

/**
 * WhatsApp Flow Endpoint - Data Exchange Request
 * Represents the structure of a data exchange request
 */
export interface FlowDataExchangeRequest {
    action: FlowActionEnum;
    data?: Record<string, any> & { error_message?: string };
    flow_token: string;
    screen: string;
    version: '3.0';
}

/**
 * WhatsApp Flow Endpoint - Data Exchange Response
 * The expected response structure for data exchange requests
 */
export interface FlowDataExchangeResponse {
    data?: Record<string, any | { error_message?: string }>;
    screen?: string;
}

/**
 * WhatsApp Flow Endpoint - Decrypted Request Response
 * Represents the successfully decrypted data and encryption keys
 */
export interface FlowDecryptedRequestResponse {
    aesKeyBuffer: Buffer;
    decryptedBody: any;
    initialVectorBuffer: Buffer;
}

/**
 * WhatsApp Flow Endpoint - Encrypted Request Payload
 * Represents the raw encrypted data received from WhatsApp
 */
export interface FlowEncryptedRequestPayload {
    encrypted_aes_key: string;
    encrypted_flow_data: string;
    initial_vector: string;
}

/**
 * WhatsApp Flow Endpoint - Comprehensive Request Object
 * A combined type that includes all possible fields from different request types
 * with all fields being optional for flexibility
 */
export interface FlowEndpointRequest {
    action?: 'ping' | FlowActionEnum;
    data?: Record<string, any> & {
        error_key?: string;
        error_message?: string;
    };

    flow_token?: string;
    screen?: string;

    // Common fields
    version?: '3.0';
}

/**
 * WhatsApp Flow Endpoint - Response
 * Union type for all possible response types from a Flow endpoint
 */
export type FlowEndpointResponse =
    | FlowDataExchangeResponse
    | FlowErrorNotificationResponse
    | FlowHealthCheckResponse
    | FlowSuccessScreenResponse;

/**
 * WhatsApp Flow Endpoint - Error Notification Request
 * Represents the structure of an error notification request
 */
export interface FlowErrorNotificationRequest {
    action: Exclude<FlowActionEnum, FlowActionEnum.BACK>;
    data: {
        error: string;
        error_message: string;
    };
    flow_token: string;
    screen: string;
    version: '3.0';
}

/**
 * WhatsApp Flow Endpoint - Error Notification Response
 * The expected response structure for error notification requests
 */
export interface FlowErrorNotificationResponse {
    acknowledged: boolean;
}

/**
 * WhatsApp Flow Endpoint - Health Check Request
 * Represents the structure of a health check request
 */
export interface FlowHealthCheckRequest {
    action: 'ping';
    version: '3.0';
}

/**
 * WhatsApp Flow Endpoint - Health Check Response
 * The expected response structure for health check requests
 */
export interface FlowHealthCheckResponse {
    data: {
        status: 'active';
    };
}

/**
 * WhatsApp Flow Endpoint - HTTP Request with Body
 * Represents an HTTP request with the encrypted payload
 */
export interface FlowHttpRequest extends IncomingMessage {
    body: FlowEncryptedRequestPayload;
    headers: IncomingHttpHeaders;
}

/**
 * Flow Migration Failure
 */
export interface FlowMigrationFailure {
    error_code: string;
    error_message: string;
    source_name: string;
}

/**
 * Flow Migration Response
 */
export interface FlowMigrationResponse {
    failed_flows: FlowMigrationFailure[];
    migrated_flows: FlowMigrationResult[];
}

/**
 * Flow Migration Result
 */
export interface FlowMigrationResult {
    migrated_id: string;
    source_id: string;
    source_name: string;
}

/**
 * Flow Preview
 */
export interface FlowPreview {
    expires_at: string;
    preview_url: string;
}

/**
 * Flow Preview Response
 */
export interface FlowPreviewResponse {
    id: string;
    preview: FlowPreview;
}

/**
 * Flows List Response
 */
export interface FlowsListResponse {
    data: Flow[];
    paging: Pagination;
}

/**
 * WhatsApp Flow Endpoint - Success Screen Response
 * The expected response structure for success screen requests
 */
export interface FlowSuccessScreenResponse {
    data: {
        extension_message_response?: {
            params?: {
                [key: string]: string;
                flow_token: string;
            };
        };
    };
    screen: 'SUCCESS';
}

export type FlowType = (typeof FlowTypeEnum)[keyof typeof FlowTypeEnum];

/**
 * Flow Validation Error
 */
export interface FlowValidationError {
    column_end: number;
    column_start: number;
    error: string;
    error_type: string;
    line_end: number;
    line_start: number;
    message: string;
    pointers: FlowValidationErrorPointer[];
}

/**
 * Flow Validation Error Pointer
 */
export interface FlowValidationErrorPointer {
    column_end: number;
    column_start: number;
    line_end: number;
    line_start: number;
    path: string;
}

/**
 * Pagination Object
 */
export interface Pagination {
    cursors: PaginationCursors;
}

/**
 * Pagination Cursors
 */
export interface PaginationCursors {
    after: string;
    before: string;
}

/**
 * Update Flow Response
 */
export interface UpdateFlowResponse {
    success: boolean;
    validation_errors?: FlowValidationError[];
}

/**
 * Validate Flow JSON Response
 */
export interface ValidateFlowJsonResponse {
    success: boolean;
    valid: boolean;
    validation_errors?: FlowValidationError[];
}
