import { BaseAPI, HttpMethodsEnum, WabaConfigEnum } from '@shared/types';

import type * as fileUpload from './types';
import { objectToQueryString } from '@shared/utils';

export default class FileUploadApi extends BaseAPI implements fileUpload.FileUploadClass {
    startSession(input: fileUpload.FileSessionDetails): Promise<fileUpload.FileStartSessionResponse> {
        const params = objectToQueryString(input);

        return this.sendJson(
            HttpMethodsEnum.Post,
            `${this.config[WabaConfigEnum.AppId]}/uploads?${params}`,
            this.config[WabaConfigEnum.RequestTimeout],
            null,
        );
    }

    startResumeUpload({
        file_offset = 0,
        upload_session_id,
        body,
    }: fileUpload.FileUploadDetails): Promise<fileUpload.FileStartResumeUploadResponse> {
        return this.sendJson(
            HttpMethodsEnum.Post,
            upload_session_id,
            this.config[WabaConfigEnum.RequestTimeout],
            body,
            {
                file_offset: String(file_offset),
                Authorization: `OAuth ${this.config[WabaConfigEnum.AccessToken]}`,
            },
        );
    }

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
}
