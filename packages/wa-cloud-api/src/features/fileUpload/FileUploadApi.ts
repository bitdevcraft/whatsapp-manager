import { BaseAPI, HttpMethodsEnum, WabaConfigEnum } from '@shared/types';
import { objectToQueryString } from '@shared/utils';

import type * as fileUpload from './types';

export default class FileUploadApi extends BaseAPI implements fileUpload.FileUploadClass {
    getInterruptedUpload(uploadSessionId: string): Promise<fileUpload.FileInterruptedUploadResponse> {
        return this.sendJson(
            HttpMethodsEnum.Get,
            `upload:${uploadSessionId}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
            {
                Authorization: `OAuth ${this.config[WabaConfigEnum.AccessToken]}`,
            },
        );
    }

    startResumeUpload({
        body,
        file_offset = 0,
        upload_session_id,
    }: fileUpload.FileUploadDetails): Promise<fileUpload.FileStartResumeUploadResponse> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            upload_session_id,
            this.config[WabaConfigEnum.RequestTimeout],
            body,
            {
                Authorization: `OAuth ${this.config[WabaConfigEnum.AccessToken]}`,
                file_offset: String(file_offset),
            },
        );
    }

    startSession(input: fileUpload.FileSessionDetails): Promise<fileUpload.FileStartSessionResponse> {
        const params = objectToQueryString(input);

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.AppId]}/uploads?${params}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }
}
