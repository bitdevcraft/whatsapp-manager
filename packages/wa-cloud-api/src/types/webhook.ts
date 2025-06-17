import {
  ConversationTypesEnum,
  CurrencyCodesEnum,
  DocumentMediaTypesEnum,
  ImageMediaTypesEnum,
  MessageTypesEnum,
  ReferralSourceTypesEnum,
  StatusEnum,
  StickerMediaTypesEnum,
  SystemChangeTypesEnum,
  VideoMediaTypesEnum,
} from "./enums";

/**
 * Represents a message received through the webhook
 * Based on Meta's documentation: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#messages-object
 */
export interface WebhookMessage {
  id: string;
  from: string;
  timestamp: string;
  type: MessageTypesEnum;
  phoneNumberId: string;
  displayPhoneNumber: string;
  profileName: string;

  // Messages Type
  audio?: AudioObject;
  button?: ButtonObject;
  contacts?: ContactMessageObject[];
  context?: ConTextObject;
  document?: DocumentObject;
  errors?: ErrorObject[];
  identity?: IdentityObject;
  image?: ImageObject;
  interactive?: InteractiveObject;
  location?: LocationObject;
  order?: Order_Object;
  reaction?: ReactionObject;
  referral?: ReferralObject;
  sticker?: StickerObject;
  system?: SystemObject;
  text?: TextObject;
  video?: VideoObject;

  // Original Data
  originalData: any;
}

/**
 * Represents a non-message event received through the webhook
 */
export interface WebhookEvent {
  /**
   * The field type of the event
   */
  field: string;

  /**
   * The event data
   */
  value: any;
}

/**
 * Handler function for processing messages
 */
export type MessageHandler = (message: WebhookMessage) => void | Promise<void>;

/**
 * Handler function for processing events
 */
export type EventHandler = (event: WebhookEvent) => void | Promise<void>;

type PricingObject = {
  category: ConversationTypesEnum;
  pricing_model: "CBP";
};

type OriginObject = {
  type: ConversationTypesEnum;
};

type ConversationObject = {
  id: string;
  origin: OriginObject;
  expiration_timestamp: string;
};

type ErrorDataObject = {
  details: string;
};

type ErrorObject = {
  code: number;
  title: string;
  message: string;
  error_data: ErrorDataObject;
};

export type StatusesObject = {
  conversation: ConversationObject;
  errors: ErrorObject[];
  id: string;
  pricing: PricingObject;
  recipient_id: string;
  status: StatusEnum;
  timestamp: string;
};

type AudioObject = {
  id: string;
  mime_type: string;
  voice?: boolean;
};

type ButtonObject = {
  payload: string;
  text: string;
};

type ConTextObject = {
  forwarded: boolean;
  frequently_forwarded: boolean;
  from: string;
  id: string;
  message_id?: string;
  referred_product: {
    catalog_id: string;
    product_retailer_id: string;
  };
};

type DocumentObject = {
  caption?: string;
  filename: string;
  sha256?: string;
  mime_type: DocumentMediaTypesEnum;
  id: string;
};

type IdentityObject = {
  acknowledged: string;
  created_timestamp: string;
  hash: string;
};

type ImageObject = {
  caption?: string;
  sha256?: string;
  id: string;
  mime_type: ImageMediaTypesEnum;
};

type ButtonReplyObject = {
  button_reply: {
    id: string;
    title: string;
  };
};

type ListReplyObject = {
  list_reply: {
    id: string;
    title: string;
    description: string;
  };
};

type NfmReplyObject = {
  nfm_reply: {
    response_json: string;
    body: string;

    name: string;
  };
};

type InteractiveObject = {
  type: ButtonReplyObject | ListReplyObject | NfmReplyObject;
};

type ProductItemsObject = {
  product_retailer_id: string;
  quantity: string;
  item_price: string;
  currency: CurrencyCodesEnum;
};

type Order_Object = {
  catalog_id: string;
  text?: string;
  product_items: ProductItemsObject[];
};

type ReactionObject = {
  message_id: string;
  emoji: string;
};

type ReferralObject = {
  source_url: URL;
  source_type: ReferralSourceTypesEnum;
  source_id: string;
  headline: string;
  body: string;
  media_type: ImageMediaTypesEnum | VideoMediaTypesEnum;
  image_url: URL;
  video_url: URL;
  thumbnail_url: URL;
};

type StickerObject = {
  mime_type: StickerMediaTypesEnum;
  sha256?: string;
  id: string;
  animated: boolean;
};

type SystemObject = {
  body: string;
  identity: string;
  new_wa_id: string;
  wa_id: string;
  type: SystemChangeTypesEnum;
  customer: string;
};

type TextObject = {
  body: string;
};

type VideoObject = {
  caption?: string;
  filename?: string;
  sha256?: string;
  id: string;
  mime_type: VideoMediaTypesEnum;
};

type LocationObject = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
};

export type MessagesObject = {
  id: string;
  from: string;
  timestamp: string;
  type: MessageTypesEnum;

  audio?: AudioObject;
  button?: ButtonObject;
  contacts?: ContactMessageObject[];
  context?: ConTextObject;
  document?: DocumentObject;
  errors?: ErrorObject[];
  identity?: IdentityObject;
  image?: ImageObject;
  interactive?: InteractiveObject;
  location?: LocationObject;
  order?: Order_Object;
  reaction?: ReactionObject;
  referral: ReferralObject;
  sticker?: StickerObject;
  system?: SystemObject;
  text?: TextObject;
  video?: VideoObject;
};

type ProfileObject = {
  name: string;
};

type ContactObject = {
  wa_id: string;
  user_id?: string;
  profile: ProfileObject;
};

type ContactMessageObject = {
  name: ContactNameObject;
  phones?: ContactPhoneObject[];
  emails?: ContactEmailObject[];
  addresses?: ContactAddressObject[];
  org?: ContactOrgObject;
  urls?: ContactUrlObject[];
  birthday?: string;
};

type ContactNameObject = {
  formatted_name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  prefix?: string;
};

type ContactPhoneObject = {
  phone: string;
  type?: string;
  wa_id?: string;
};

type ContactEmailObject = {
  email: string;
  type?: string;
};

type ContactAddressObject = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  country_code?: string;
  type?: string;
};

type ContactOrgObject = {
  company?: string;
  department?: string;
  title?: string;
};

type ContactUrlObject = {
  url: string;
  type?: string;
};

type MetadataObject = {
  display_phone_number: string;
  phone_number_id: string;
};

export type ValueObject = {
  messaging_product: "whatsapp";
  contacts: ContactObject[];
  errors: ErrorObject[];
  messages: MessagesObject[];
  metadata: MetadataObject;
  statuses: StatusesObject[];
};

type ChangesObject = {
  field: string;
  value: ValueObject;
};

type Entry_Object = {
  id: string;
  changes: ChangesObject[];
};

export type WebhookObject = {
  object: "whatsapp_business_account";
  entry: Entry_Object[];
};

export type WebhookSubscribeQuery = {
  hub: {
    mode: "subscribe";
    challenge: string;
    verify_token: string;
  };
};
