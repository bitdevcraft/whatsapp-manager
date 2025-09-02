import { WhatsAppConfig } from '@shared/types/config';
import {
    BusinessProfileApi,
    EncryptionApi,
    FileUploadApi,
    FlowApi,
    MediaApi,
    MessagesApi,
    PhoneNumberApi,
    QrCodeApi,
    RegistrationApi,
    TemplateApi,
    TwoStepVerificationApi,
    WabaApi,
} from 'src/features';

export declare class WhatsAppClass {
    readonly businessProfile: BusinessProfileApi;
    readonly encryption: EncryptionApi;
    readonly fileUpload: FileUploadApi;
    readonly flow: FlowApi;
    readonly media: MediaApi;
    readonly messages: MessagesApi;
    readonly phoneNumber: PhoneNumberApi;
    readonly qrCode: QrCodeApi;
    readonly registration: RegistrationApi;
    readonly templates: TemplateApi;
    readonly twoStepVerification: TwoStepVerificationApi;
    readonly waba: WabaApi;
    constructor(config?: WhatsAppConfig);
    updateAccessToken(accessToken: string): boolean;
    updatePhoneNumberId(phoneNumberId: number): boolean;
    updateTimeout(ms: number): boolean;
    updateWabaId(wabaId: string): boolean;
}
