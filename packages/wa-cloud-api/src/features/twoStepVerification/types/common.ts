import type { ResponseSuccess } from '@shared/types/request';

export interface TwoStepVerificationClass {
    setTwoStepVerificationCode(pin: string): Promise<ResponseSuccess>;
}

export interface TwoStepVerificationRequest {
    pin: string;
}
