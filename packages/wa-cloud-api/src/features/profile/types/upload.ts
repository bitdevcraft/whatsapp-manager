/**
 * Request parameters for creating upload session.
 */
export interface CreateUploadSessionParams {
    /**
     * Length of the file to be uploaded in bytes.
     */
    fileLength: number;
    /**
     * Name of the file with extension.
     */
    fileName: string;
    /**
     * MIME type of the file (e.g., 'image/jpeg').
     */
    fileType: string;
}

/**
 * Request parameters for getting upload handle.
 */
export interface GetUploadHandleParams {
    /**
     * The upload session ID from createUploadSession response.
     */
    uploadId: string;
}

/**
 * Response from uploading business profile media.
 */
export interface UploadBusinessProfileResponse {
    h: string;
}

/**
 * Upload handle information containing file details and handle.
 */
export interface UploadHandle {
    file_size: number;
    handle: string;
    upload_result: {
        handle_type: string;
        name: string;
    };
}

/**
 * Request parameters for uploading media.
 */
export interface UploadMediaParams {
    /**
     * The binary data of the file (Buffer).
     */
    file: Buffer;
    /**
     * The upload session ID from createUploadSession response.
     */
    uploadId: string;
}

/**
 * Upload session information for creating upload sessions.
 */
export interface UploadSession {
    id: string;
    video?: boolean;
}

/**
 * Response from creating an upload session.
 */
export interface UploadSessionResponse {
    id: string;
}
