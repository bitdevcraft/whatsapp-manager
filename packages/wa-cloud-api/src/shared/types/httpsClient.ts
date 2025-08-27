import { HttpMethodsEnum } from './enums';

export type ResponseHeaders = Record<string, ResponseHeaderValue>;

export type ResponseHeaderValue = string | string[] | undefined;

export type ResponseJSONBody = Record<string, unknown>;

export declare class HttpsClientClass {
    clearSockets: () => boolean;
    sendRequest: (
        host: string,
        path: string,
        method: HttpMethodsEnum,
        headers: HeadersInit,
        timeout: number,
        body?: BodyInit | null,
    ) => Promise<HttpsClientResponseClass>;
    constructor();
}

export declare class HttpsClientResponseClass {
    headers: () => ResponseHeaders;
    json: () => Promise<ResponseJSONBody>;
    rawResponse: () => Response;
    statusCode: () => number;
    constructor(resp: Response);
}
