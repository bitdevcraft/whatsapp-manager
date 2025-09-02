import type { WabaConfigType } from './config';

export declare class BaseClass {
    constructor(config: WabaConfigType);
}

import type { RequesterClass } from './request';

import Logger from '../utils/logger';
import { HttpMethodsEnum } from './enums';

const LIB_NAME = 'BaseAPI';
const LOG_LOCAL = false;
const LOGGER = new Logger(LIB_NAME, process.env.DEBUG === 'true' || LOG_LOCAL);

export class BaseAPI implements BaseClass {
    protected client: RequesterClass;
    protected config: WabaConfigType;

    constructor(config: WabaConfigType, client: RequesterClass) {
        this.config = config;
        this.client = client;
        LOGGER.log('Initialized with HTTPSClient');
    }

    protected sendFormData<T>(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        body?: any,
        additionalHeaders?: Record<string, string>,
    ): Promise<T> {
        return this.client.sendFormData<T>(method, endpoint, timeout, body, additionalHeaders);
    }

    protected sendJson<T>(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        body?: any,
        additionalHeaders?: Record<string, string>,
    ): Promise<T> {
        return this.client.getJson<T>(method, endpoint, timeout, body, additionalHeaders);
    }

    protected sendUrlEncodedForm<T>(
        method: HttpMethodsEnum,
        endpoint: string,
        timeout: number,
        body?: any,
        additionalHeaders?: Record<string, string>,
    ): Promise<T> {
        return this.client.sendUrlEncodedForm<T>(method, endpoint, timeout, body, additionalHeaders);
    }
}
