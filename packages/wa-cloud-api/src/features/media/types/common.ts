import type { ResponseSuccess } from '@shared/types/request';

export interface MediaClass {
    deleteMedia(mediaId: string, phone_number_id?: string): Promise<ResponseSuccess>;
    downloadMedia(mediaUrl: string): Promise<Blob>;
    getMediaById(mediaId: string, phone_number_id?: string): Promise<MediaResponse>;
    uploadMedia(file: File, messagingProduct?: string): Promise<UploadMediaResponse>;
}

export interface MediaResponse {
    file_size: number;
    id: string;
    messaging_product: 'whatsapp';
    mime_type: string;
    sha256: string;
    url: string;
}

export interface MediasResponse {
    data: MediaResponse[];
    paging: {
        cursors: {
            after: string;
            before: string;
        };
    };
}

export interface UploadMediaResponse {
    id: string;
}
