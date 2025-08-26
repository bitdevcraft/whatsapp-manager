import type { ResponseSuccess } from '@shared/types/request';

import { DataLocalizationRegionEnum } from '@shared/types/enums';

export interface RegistrationClass {
    deregister(): Promise<ResponseSuccess>;
    register(pin: string, dataLocalizationRegion?: DataLocalizationRegionEnum): Promise<ResponseSuccess>;
}

export interface RegistrationRequest {
    data_localization_region?: DataLocalizationRegionEnum;
    messaging_product: 'whatsapp';
    pin: string;
}
