export interface FileInterruptedUploadResponse {
    file_offset: number;
    id: string;
}

export interface FileSessionDetails {
    file_length: string;
    file_name: string;
    file_type: string;
}

export interface FileStartResumeUploadResponse {
    h: string;
}

export interface FileStartSessionResponse {
    id: string;
}

export interface FileUploadClass {
    getInterruptedUpload(uploadSessionId: string): Promise<FileInterruptedUploadResponse>;
    startResumeUpload(input: FileUploadDetails): Promise<FileStartResumeUploadResponse>;
    startSession(input: FileSessionDetails): Promise<FileStartSessionResponse>;
}

export interface FileUploadDetails {
    body: Buffer<ArrayBuffer>;
    file_offset?: number;
    upload_session_id: string;
}
