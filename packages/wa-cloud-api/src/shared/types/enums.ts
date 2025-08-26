export enum AudioMediaTypesEnum {
    Aac = 'audio/aac',
    Amr = 'audio/amr',
    Mp4 = 'audio/mp4',
    Mpeg = 'audio/mpeg',
    Ogg = 'audio/ogg',
}

/**
 * Business category values for WhatsApp Business Profile.
 * These values map to specific strings displayed in the WhatsApp client.
 */
export enum BusinessVerticalEnum {
    /**
     * Alcoholic Beverages
     */
    ALCOHOL = 'ALCOHOL',
    /**
     * Clothing and Apparel
     */
    APPAREL = 'APPAREL',
    /**
     * Automotive
     */
    AUTO = 'AUTO',
    /**
     * Beauty, Spa and Salon
     */
    BEAUTY = 'BEAUTY',
    /**
     * Education
     */
    EDU = 'EDU',
    /**
     * Entertainment
     */
    ENTERTAIN = 'ENTERTAIN',
    /**
     * Event Planning and Service
     */
    EVENT_PLAN = 'EVENT_PLAN',
    /**
     * Finance and Banking
     */
    FINANCE = 'FINANCE',
    /**
     * Public Service
     */
    GOVT = 'GOVT',
    /**
     * Food and Grocery
     */
    GROCERY = 'GROCERY',
    /**
     * Medical and Health
     */
    HEALTH = 'HEALTH',
    /**
     * Hotel and Lodging
     */
    HOTEL = 'HOTEL',
    /**
     * Non-profit
     */
    NONPROFIT = 'NONPROFIT',
    /**
     * Online Gambling & Gaming
     */
    ONLINE_GAMBLING = 'ONLINE_GAMBLING',
    /**
     * Over-the-Counter Drugs
     */
    OTC_DRUGS = 'OTC_DRUGS',
    /**
     * Other
     */
    OTHER = 'OTHER',
    /**
     * Non-Online Gambling & Gaming (E.g. Brick and mortar)
     */
    PHYSICAL_GAMBLING = 'PHYSICAL_GAMBLING',
    /**
     * Professional Services
     */
    PROF_SERVICES = 'PROF_SERVICES',
    /**
     * Restaurant
     */
    RESTAURANT = 'RESTAURANT',
    /**
     * Shopping and Retail
     */
    RETAIL = 'RETAIL',
    /**
     * Travel and Transportation
     */
    TRAVEL = 'TRAVEL',
}

export enum ButtonPositionEnum {
    Fifth = 5,
    First = 1,
    Fourth = 4,
    Second = 2,
    Third = 3,
}

export enum CategoryEnum {
    Authentication = 'AUTHENTICATION',
    Marketing = 'MARKETING',
    Utility = 'UTILITY',
}

export enum ComponentTypesEnum {
    Body = 'BODY',
    Button = 'BUTTON',
    Carousel = 'CAROUSEL',
    Footer = 'FOOTER',
    Header = 'HEADER',
}

export enum ConversationTypesEnum {
    BusinessInitiated = 'business_initiated',
    CustomerInitiated = 'customer_initiated',
    ReferralConversion = 'referral_conversion',
}

export enum CurrencyCodesEnum {
    ADP = 'ADP',
    AED = 'AED',
    AFA = 'AFA',
    AFN = 'AFN',
    ALK = 'ALK',
    ALL = 'ALL',
    AMD = 'AMD',
    ANG = 'ANG',
    AOA = 'AOA',
    AOK = 'AOK',
    AON = 'AON',
    AOR = 'AOR',
    ARA = 'ARA',
    ARP = 'ARP',
    ARS = 'ARS',
    ARY = 'ARY',
    ATS = 'ATS',
    AUD = 'AUD',
    AWG = 'AWG',
    AYM = 'AYM',
    AZM = 'AZM',
    AZN = 'AZN',
    BAD = 'BAD',
    BAM = 'BAM',
    BBD = 'BBD',
    BDT = 'BDT',
    BEC = 'BEC',
    BEF = 'BEF',
    BEL = 'BEL',
    BGJ = 'BGJ',
    BGK = 'BGK',
    BGL = 'BGL',
    BGN = 'BGN',
    BHD = 'BHD',
    BIF = 'BIF',
    BMD = 'BMD',
    BND = 'BND',
    BOB = 'BOB',
    BOP = 'BOP',
    BOV = 'BOV',
    BRB = 'BRB',
    BRC = 'BRC',
    BRE = 'BRE',
    BRL = 'BRL',
    BRN = 'BRN',
    BRR = 'BRR',
    BSD = 'BSD',
    BTN = 'BTN',
    BUK = 'BUK',
    BWP = 'BWP',
    BYB = 'BYB',
    BYN = 'BYN',
    BYR = 'BYR',
    BZD = 'BZD',
    CAD = 'CAD',
    CDF = 'CDF',
    CHC = 'CHC',
    CHE = 'CHE',
    CHF = 'CHF',
    CHW = 'CHW',
    CLF = 'CLF',
    CLP = 'CLP',
    CNY = 'CNY',
    COP = 'COP',
    COU = 'COU',
    CRC = 'CRC',
    CSD = 'CSD',
    CSJ = 'CSJ',
    CSK = 'CSK',
    CUC = 'CUC',
    CUP = 'CUP',
    CVE = 'CVE',
    CYP = 'CYP',
    CZK = 'CZK',
    DDM = 'DDM',
    DEM = 'DEM',
    DJF = 'DJF',
    DKK = 'DKK',
    DOP = 'DOP',
    DZD = 'DZD',
    ECS = 'ECS',
    ECV = 'ECV',
    EEK = 'EEK',
    EGP = 'EGP',
    ERN = 'ERN',
    ESA = 'ESA',
    ESB = 'ESB',
    ESP = 'ESP',
    ETB = 'ETB',
    EUR = 'EUR',
    FIM = 'FIM',
    FJD = 'FJD',
    FKP = 'FKP',
    FRF = 'FRF',
    GBP = 'GBP',
    GEK = 'GEK',
    GEL = 'GEL',
    GHC = 'GHC',
    GHP = 'GHP',
    GHS = 'GHS',
    GIP = 'GIP',
    GMD = 'GMD',
    GNE = 'GNE',
    GNF = 'GNF',
    GNS = 'GNS',
    GQE = 'GQE',
    GRD = 'GRD',
    GTQ = 'GTQ',
    GWE = 'GWE',
    GWP = 'GWP',
    GYD = 'GYD',
    HKD = 'HKD',
    HNL = 'HNL',
    HRD = 'HRD',
    HRK = 'HRK',
    HTG = 'HTG',
    HUF = 'HUF',
    IDR = 'IDR',
    IEP = 'IEP',
    ILP = 'ILP',
    ILR = 'ILR',
    ILS = 'ILS',
    INR = 'INR',
    IQD = 'IQD',
    IRR = 'IRR',
    ISJ = 'ISJ',
    ISK = 'ISK',
    ITL = 'ITL',
    JMD = 'JMD',
    JOD = 'JOD',
    JPY = 'JPY',
    KES = 'KES',
    KGS = 'KGS',
    KHR = 'KHR',
    KMF = 'KMF',
    KPW = 'KPW',
    KRW = 'KRW',
    KWD = 'KWD',
    KYD = 'KYD',
    KZT = 'KZT',
    LAJ = 'LAJ',
    LAK = 'LAK',
    LBP = 'LBP',
    LKR = 'LKR',
    LRD = 'LRD',
    LSL = 'LSL',
    LSM = 'LSM',
    LTL = 'LTL',
    LTT = 'LTT',
    LUC = 'LUC',
    LUF = 'LUF',
    LUL = 'LUL',
    LVL = 'LVL',
    LVR = 'LVR',
    LYD = 'LYD',
    MAD = 'MAD',
    MDL = 'MDL',
    MGA = 'MGA',
    MGF = 'MGF',
    MKD = 'MKD',
    MLF = 'MLF',
    MMK = 'MMK',
    MNT = 'MNT',
    MOP = 'MOP',
    MRO = 'MRO',
    MRU = 'MRU',
    MTL = 'MTL',
    MTP = 'MTP',
    MUR = 'MUR',
    MVQ = 'MVQ',
    MVR = 'MVR',
    MWK = 'MWK',
    MXN = 'MXN',
    MXP = 'MXP',
    MXV = 'MXV',
    MYR = 'MYR',
    MZE = 'MZE',
    MZM = 'MZM',
    MZN = 'MZN',
    NAD = 'NAD',
    NGN = 'NGN',
    NIC = 'NIC',
    NIO = 'NIO',
    NLG = 'NLG',
    NOK = 'NOK',
    NPR = 'NPR',
    NZD = 'NZD',
    OMR = 'OMR',
    PAB = 'PAB',
    PEH = 'PEH',
    PEI = 'PEI',
    PEN = 'PEN',
    PES = 'PES',
    PGK = 'PGK',
    PHP = 'PHP',
    PKR = 'PKR',
    PLN = 'PLN',
    PLZ = 'PLZ',
    PTE = 'PTE',
    PYG = 'PYG',
    QAR = 'QAR',
    RHD = 'RHD',
    ROK = 'ROK',
    ROL = 'ROL',
    RON = 'RON',
    RSD = 'RSD',
    RUB = 'RUB',
    RUR = 'RUR',
    RWF = 'RWF',
    SAR = 'SAR',
    SBD = 'SBD',
    SCR = 'SCR',
    SDD = 'SDD',
    SDG = 'SDG',
    SDP = 'SDP',
    SEK = 'SEK',
    SGD = 'SGD',
    SHP = 'SHP',
    SIT = 'SIT',
    SKK = 'SKK',
    SLL = 'SLL',
    SOS = 'SOS',
    SRD = 'SRD',
    SRG = 'SRG',
    SSP = 'SSP',
    STD = 'STD',
    STN = 'STN',
    SUR = 'SUR',
    SVC = 'SVC',
    SYP = 'SYP',
    SZL = 'SZL',
    THB = 'THB',
    TJR = 'TJR',
    TJS = 'TJS',
    TMM = 'TMM',
    TMT = 'TMT',
    TND = 'TND',
    TOP = 'TOP',
    TPE = 'TPE',
    TRL = 'TRL',
    TRY = 'TRY',
    TTD = 'TTD',
    TWD = 'TWD',
    TZS = 'TZS',
    UAH = 'UAH',
    UAK = 'UAK',
    UGS = 'UGS',
    UGW = 'UGW',
    UGX = 'UGX',
    USD = 'USD',
    USN = 'USN',
    USS = 'USS',
    UYI = 'UYI',
    UYN = 'UYN',
    UYP = 'UYP',
    UYU = 'UYU',
    UYW = 'UYW',
    UZS = 'UZS',
    VEB = 'VEB',
    VEF = 'VEF',
    VES = 'VES',
    VNC = 'VNC',
    VND = 'VND',
    VUV = 'VUV',
    WST = 'WST',
    XAF = 'XAF',
    XAG = 'XAG',
    XAU = 'XAU',
    XBA = 'XBA',
    XBB = 'XBB',
    XBC = 'XBC',
    XBD = 'XBD',
    XCD = 'XCD',
    XDR = 'XDR',
    XEU = 'XEU',
    XFO = 'XFO',
    XFU = 'XFU',
    XOF = 'XOF',
    XPD = 'XPD',
    XPF = 'XPF',
    XPT = 'XPT',
    XRE = 'XRE',
    XSU = 'XSU',
    XTS = 'XTS',
    XUA = 'XUA',
    XXX = 'XXX',
    YDD = 'YDD',
    YER = 'YER',
    YUD = 'YUD',
    YUM = 'YUM',
    YUN = 'YUN',
    ZAL = 'ZAL',
    ZAR = 'ZAR',
    ZMK = 'ZMK',
    ZMW = 'ZMW',
    ZRN = 'ZRN',
    ZRZ = 'ZRZ',
    ZWC = 'ZWC',
    ZWD = 'ZWD',
    ZWL = 'ZWL',
    ZWN = 'ZWN',
    ZWR = 'ZWR',
}

export enum DataLocalizationRegionEnum {
    AE = 'AE', // United Arab Emirates
    // APAC
    AU = 'AU', // Australia
    // MEA
    BH = 'BH', // Bahrain
    // LATAM
    BR = 'BR', // Brazil
    // NORAM
    CA = 'CA', // Canada
    CH = 'CH', // Switzerland

    // Europe
    DE = 'DE', // EU (Germany)
    GB = 'GB', // United Kingdom
    ID = 'ID', // Indonesia

    IN = 'IN', // India

    JP = 'JP', // Japan
    KR = 'KR', // South Korea
    SG = 'SG', // Singapore

    ZA = 'ZA', // South Africa
}

export enum DocumentMediaTypesEnum {
    Excel = 'application/vnd.ms-excel',
    OpenDoc = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    OpenPres = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    OpenSheet = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    Pdf = 'application/pdf',
    Ppt = 'application/vnd.ms-powerpoint',
    Text = 'text/plain',
    Word = 'application/msword',
}

export enum HttpMethodsEnum {
    Delete = 'DELETE',
    Get = 'GET',
    Post = 'POST',
    Put = 'PUT',
}

export enum ImageMediaTypesEnum {
    Jpeg = 'image/jpeg',
    Png = 'image/png',
}

export enum InteractiveTypesEnum {
    AddressMessage = 'address_message',
    Button = 'button',
    CtaUrl = 'cta_url',
    Flow = 'flow',
    List = 'list',
    LocationRequest = 'location_request_message',
    Product = 'product',
    ProductList = 'product_list',
}

export enum LanguagesEnum {
    Afrikaans = 'af',
    Albanian = 'sq',
    Arabic = 'ar',
    Azerbaijani = 'az',
    Bengali = 'bn',
    Bulgarian = 'bg',
    Catalan = 'ca',
    Chinese_CHN = 'zh_CN',
    Chinese_HKG = 'zh_HK',
    Chinese_TAI = 'zh_TW',
    Croatian = 'hr',
    Czech = 'cs',
    Danish = 'da',
    Dutch = 'nl',
    English = 'en',
    English_UK = 'en_GB',
    English_US = 'en_US',
    Estonian = 'et',
    Filipino = 'fil',
    Finnish = 'fi',
    French = 'fr',
    Georgian = 'ka',
    German = 'de',
    Greek = 'el',
    Gujarati = 'gu',
    Hausa = 'ha',
    Hebrew = 'he',
    Hindi = 'hi',
    Hungarian = 'hu',
    Indonesian = 'id',
    Irish = 'ga',
    Italian = 'it',
    Japanese = 'ja',
    Kannada = 'kn',
    Kazakh = 'kk',
    Kinyarwanda = 'rw_RW',
    Korean = 'ko',
    Kyrgyz_Kyrgyzstan = 'ky_KG',
    Lao = 'lo',
    Latvian = 'lv',
    Lithuanian = 'lt',
    Macedonian = 'mk',
    Malay = 'ms',
    Malayalam = 'ml',
    Marathi = 'mr',
    Norwegian = 'nb',
    Persian = 'fa',
    Polish = 'pl',
    Portuguese_BR = 'pt_BR',
    Portuguese_POR = 'pt_PT',
    Punjabi = 'pa',
    Romanian = 'ro',
    Russian = 'ru',
    Serbian = 'sr',
    Slovak = 'sk',
    Slovenian = 'sl',
    Spanish = 'es',
    Spanish_ARG = 'es_AR',
    Spanish_MEX = 'es_MX',
    Spanish_SPA = 'es_ES',
    Swahili = 'sw',
    Swedish = 'sv',
    Tamil = 'ta',
    Telugu = 'te',
    Thai = 'th',
    Turkish = 'tr',
    Ukrainian = 'uk',
    Urdu = 'ur',
    Uzbek = 'uz',
    Vietnamese = 'vi',
    Zulu = 'zu',
}

export enum MessageTypesEnum {
    '*' = '*',
    Audio = 'audio',
    Button = 'button',
    Contacts = 'contacts',
    Document = 'document',
    Image = 'image',
    Interactive = 'interactive',
    Location = 'location',
    Order = 'order',
    Reaction = 'reaction',
    Statuses = 'statuses',
    Sticker = 'sticker',
    System = 'system',
    Template = 'template',
    Text = 'text',
    Unknown = 'unknown',
    Video = 'video',
}

export enum ParametersTypesEnum {
    Action = 'ACTION',
    CouponCode = 'COUPON_CODE',
    Currency = 'CURRENCY',
    DateTime = 'DATE_TIME',
    Document = 'DOCUMENT',
    ExpirationTimeMs = 'EXPIRATION_TIME_MS',
    Image = 'IMAGE',
    LimitedTimeOffer = 'LIMITED_TIME_OFFER',
    Location = 'LOCATION',
    OrderStatus = 'ORDER_STATUS',
    Payload = 'PAYLOAD',
    Product = 'PRODUCT',
    Text = 'TEXT',
    TtlMinutes = 'TTL_MINUTES',
    Video = 'VIDEO',
    WebviewInteraction = 'WEBVIEW_INTERACTION',
    WebviewPresentation = 'WEBVIEW_PRESENTATION',
}

export enum ReferralSourceTypesEnum {
    Ad = 'ad',
    Post = 'post',
}

export enum RequestCodeMethodsEnum {
    Sms = 'SMS',
    Voice = 'VOICE',
}

export enum StatusEnum {
    Delivered = 'delivered',
    Read = 'read',
    Sent = 'sent',
}

export enum StickerMediaTypesEnum {
    Webp = 'image/webp',
}

export enum SubTypeEnum {
    Catalog = 'CATALOG',
    CopyCode = 'COPY_CODE',
    Flow = 'FLOW',
    Mpm = 'MPM',
    OrderDetails = 'ORDER_DETAILS',
    QuickReply = 'QUICK_REPLY',
    Reminder = 'REMINDER',
    Url = 'URL',
    VoiceCall = 'VOICE_CALL',
}

export enum SystemChangeTypesEnum {
    CustomerChangedNumber = 'customer_changed_number',
    CustomerIdentityChanged = 'customer_identity_changed',
}

export enum TemplateStatusEnum {
    Approved = 'APPROVED',
    Pending = 'PENDING',
    Rejected = 'REJECTED',
}

export enum VideoMediaTypesEnum {
    Mp4 = 'video/mp4',
    Threegp = 'video/3gp',
}

export enum WabaConfigEnum {
    AccessToken = 'CLOUD_API_ACCESS_TOKEN',
    APIVersion = 'CLOUD_API_VERSION',
    AppId = 'M4D_APP_ID',
    AppSecret = 'M4D_APP_SECRET',
    BusinessAcctId = 'WA_BUSINESS_ACCOUNT_ID',
    Debug = 'DEBUG',
    ListenerPort = 'LISTENER_PORT',
    MaxRetriesAfterWait = 'MAX_RETRIES_AFTER_WAIT',
    Passphrase = 'FLOW_API_PASSPHRASE',
    PhoneNumberId = 'WA_PHONE_NUMBER_ID',
    Port = 'WA_PORT',
    PrivatePem = 'FLOW_API_PRIVATE_PEM',
    RequestTimeout = 'REQUEST_TIMEOUT',
    WebhookEndpoint = 'WEBHOOK_ENDPOINT',
    WebhookVerificationToken = 'WEBHOOK_VERIFICATION_TOKEN',
}

export enum WebhookTypesEnum {
    Audio = 'audio',
    Button = 'button',
    Document = 'document',
    Image = 'image',
    Interactive = 'interactive',
    Order = 'order',
    Sticker = 'sticker',
    System = 'system',
    Text = 'text',
    Unknown = 'unknown',
    Video = 'video',
}
