import { MessageTypesEnum } from '@shared/types/enums';

import { MessageRequestBody } from './common';

export interface ContactObject {
    addresses?: AddressesObject[];
    birthday?: `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
    emails?: EmailObject[];
    name: NameObject;
    org?: OrgObject;
    phones?: PhoneObject[];
    urls?: URLObject[];
}

export type ContactsMessageRequestBody = MessageRequestBody<MessageTypesEnum.Contacts> & {
    [MessageTypesEnum.Contacts]: [ContactObject];
};

// Contact Message Types
interface AddressesObject {
    city?: string;
    country?: string;
    country_code?: string;
    state?: string;
    street?: string;
    type?: 'HOME' | 'WORK' | string;
    zip?: string;
}

interface EmailObject {
    email?: string;
    type?: 'HOME' | 'WORK' | string;
}

interface NameObject {
    first_name?: string;
    formatted_name: string;
    last_name?: string;
    middle_name?: string;
    prefix?: string;
    suffix?: string;
}

interface OrgObject {
    company?: string;
    department?: string;
    title?: string;
}

interface PhoneObject {
    phone?: 'PHONE_NUMBER';
    type?: 'CELL' | 'HOME' | 'IPHONE' | 'MAIN' | 'WORK' | string;
    wa_id?: string;
}

interface URLObject {
    type?: 'HOME' | 'WORK' | string;
    url?: string;
}
