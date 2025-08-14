export type FileStartSessionResponse = {
    id: string;
};

export type FileStartResumeUploadResponse = {
    h: string;
};

export type FileInterruptedUploadResponse = {
    id: string;
    file_offset: number;
};

export type FileSessionDetails = {
    file_name: string;
    file_length: string;
    file_type: string;
};

export type FileUploadDetails = {
    file_offset?: number;
    upload_session_id: string;
    body: Buffer<ArrayBuffer>;
};

export interface FileUploadClass {
    startSession(input: FileSessionDetails): Promise<FileStartSessionResponse>;
    startResumeUpload(input: FileUploadDetails): Promise<FileStartResumeUploadResponse>;
    getInterruptedUpload(uploadSessionId: string): Promise<FileInterruptedUploadResponse>;
}
