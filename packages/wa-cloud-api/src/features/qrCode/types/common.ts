import type { ResponseData, ResponseSuccess } from '@shared/types/request';

export interface CreateQrCodeRequest {
    generate_qr_image?: 'PNG' | 'SVG';
    prefilled_message: string;
}

export interface QrCodeClass {
    createQrCode(request: CreateQrCodeRequest): Promise<QrCodeResponse>;
    deleteQrCode(qrCodeId: string): Promise<ResponseSuccess>;
    getQrCode(qrCodeId: string): Promise<QrCodeResponse>;
    getQrCodes(): Promise<QrCodesResponse>;
    updateQrCode(request: UpdateQrCodeRequest): Promise<QrCodeResponse>;
}

export interface QrCodeResponse {
    code: string;
    deep_link_url: string;
    prefilled_message: string;
    qr_image_url?: string;
}

export type QrCodesResponse = ResponseData<QrCodeResponse[]>;

export interface UpdateQrCodeRequest {
    code: string;
    prefilled_message: string;
}
