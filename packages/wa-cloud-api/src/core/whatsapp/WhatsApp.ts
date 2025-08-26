import EncryptionApi from '@features/encryption';
import FileUploadApi from '@features/fileUpload';
import FlowApi from '@features/flow';
import MediaApi from '@features/media';
import MessagesApi from '@features/messages';
import PhoneNumberApi from '@features/phone';
import BusinessProfileApi from '@features/profile';
import QrCodeApi from '@features/qrCode/QrCodeApi';
import RegistrationApi from '@features/registration';
import TemplateApi from '@features/template/TemplateApi';
import TwoStepVerificationApi from '@features/twoStepVerification';
import WabaApi from '@features/waba';
import { importConfig } from '@shared/config/importConfig';
import Requester from '@shared/http/request';
import { WabaConfigType, WhatsAppConfig } from '@shared/types/config';
import * as SDKEnums from '@shared/types/enums';
import Logger from '@shared/utils/logger';

import { WhatsAppClass } from './types';

const LIB_NAME = 'WHATSAPP';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

const headerPrefix = 'WA_SDK';

export default class WhatsApp implements WhatsAppClass {
    static readonly Enums = SDKEnums;

    readonly businessProfile: BusinessProfileApi;

    config: WabaConfigType;
    readonly encryption: EncryptionApi;
    readonly fileUpload: FileUploadApi;
    readonly flow: FlowApi;
    readonly media: MediaApi;
    readonly messages: MessagesApi;
    readonly phoneNumber: PhoneNumberApi;
    readonly qrCode: QrCodeApi;
    readonly registration: RegistrationApi;
    requester: Readonly<Requester>;
    readonly templates: TemplateApi;
    readonly twoStepVerification: TwoStepVerificationApi;
    readonly waba: WabaApi;

    constructor(config?: WhatsAppConfig) {
        this.config = importConfig(config);
        this.requester = new Requester(
            this.config[SDKEnums.WabaConfigEnum.APIVersion],
            this.config[SDKEnums.WabaConfigEnum.PhoneNumberId],
            this.config[SDKEnums.WabaConfigEnum.AccessToken],
            this.config[SDKEnums.WabaConfigEnum.BusinessAcctId],
            this.userAgent(),
        );

        this.messages = new MessagesApi(this.config, this.requester);
        this.templates = new TemplateApi(this.config, this.requester);
        this.phoneNumber = new PhoneNumberApi(this.config, this.requester);
        this.qrCode = new QrCodeApi(this.config, this.requester);
        this.encryption = new EncryptionApi(this.config, this.requester);
        this.twoStepVerification = new TwoStepVerificationApi(this.config, this.requester);
        this.registration = new RegistrationApi(this.config, this.requester);
        this.media = new MediaApi(this.config, this.requester);
        this.fileUpload = new FileUploadApi(this.config, this.requester);
        this.waba = new WabaApi(this.config, this.requester);
        this.flow = new FlowApi(this.config, this.requester);
        this.businessProfile = new BusinessProfileApi(this.config, this.requester);
        LOGGER.log('WhatsApp Node.js SDK instantiated!');
    }

    updateAccessToken(accessToken: string): boolean {
        this.config[SDKEnums.WabaConfigEnum.AccessToken] = accessToken;
        LOGGER.log(`Updated access token`);
        return true;
    }

    updatePhoneNumberId(phoneNumberId: number): boolean {
        this.config[SDKEnums.WabaConfigEnum.PhoneNumberId] = phoneNumberId;
        LOGGER.log(`Updated sender phone number id to ${phoneNumberId}`);
        return true;
    }

    updateTimeout(ms: number): boolean {
        this.config[SDKEnums.WabaConfigEnum.RequestTimeout] = ms;
        LOGGER.log(`Updated request timeout to ${ms}ms`);
        return true;
    }

    updateWabaId(wabaId: string): boolean {
        this.config[SDKEnums.WabaConfigEnum.BusinessAcctId] = wabaId;
        LOGGER.log(`Updated business account id to ${wabaId}`);
        return true;
    }

    private userAgent(): string {
        const userAgentString = `${headerPrefix}/0.0.1 (Node.js ${process.version})`;
        return userAgentString;
    }
}
