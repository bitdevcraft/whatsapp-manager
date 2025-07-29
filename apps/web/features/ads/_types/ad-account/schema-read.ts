import { z } from "zod";
import { AdAccountDisableReasonEnum, AdAccountStatusEnum } from "./enum";

export const AdAccountStatusSchema = z.nativeEnum(AdAccountStatusEnum);
export const AdAccountDisableReasonSchema = z.nativeEnum(
  AdAccountDisableReasonEnum
);

export const AdAccountPromotableObjectSchema = z.object({
  promotable_app_ids: z.array(z.string()).optional(),
  promotable_page_ids: z.array(z.string()).optional(),
  promotable_urls: z.array(z.string()).optional(),
});

export const AgencyClientDeclarationSchema = z.object({
  agency_representing_client: z.number().optional(),
  client_based_in_france: z.number().optional(),
  client_city: z.string().optional(),
  client_country_code: z.string().optional(),
  client_email_address: z.string().optional(),
  client_name: z.string().optional(),
  client_postal_code: z.string().optional(),
  client_province: z.string().optional(),
  client_street: z.string().optional(),
  client_street2: z.string().optional(),
  has_written_mandate_from_advertiser: z.number().optional(),
  is_client_paying_invoices: z.number().optional(),
});

// TODO: create a proper schema
export const MetaBusinessSchema = z.any();

export const CustomAudienceGroupSchema = z.object({
  audience_type_param_name: z.string().optional(),
  existing_customer_tag: z.string().optional(),
  new_customer_tag: z.string().optional(),
});

// TODO: create a proper schema
export const ExpiredFundingSourceDetailsSchema = z.any();

// TODO: create a proper schema
export const ExtendedCreditInvoiceGroupSchema = z.any();

// TODO: create a proper schema
export const DeliveryCheckSchema = z.any();

// TODO: create a proper schema
export const FundingSourceDetails = z.any();

// TODO: create a proper schema
export const ReachFrequencySpecSchema = z.any();

// Reading
export const AdAccountReadResponseSchema = z.object({
  id: z.string().optional(),
  account_id: z.string().optional(),
  account_status: AdAccountStatusSchema.optional(),
  ad_account_promotable_objects: AdAccountPromotableObjectSchema.optional(),
  age: z.number().optional(),
  agency_client_declaration: AgencyClientDeclarationSchema.optional(),
  amount_spent: z.number().optional(),
  balance: z.number().optional(),
  brand_safety_content_filter_levels: z.array(z.string()).optional(),
  business: MetaBusinessSchema.optional(),
  business_city: z.string().optional(),
  business_country_code: z.string().optional(),
  business_name: z.string().optional(),
  business_state: z.string().optional(),
  business_street: z.string().optional(),
  business_street2: z.string().optional(),
  business_zip: z.string().optional(),
  can_create_brand_lift_study: z.boolean().optional(),
  capabilities: z.array(z.string()).optional(),
  created_time: z.date().optional(),
  currency: z.string().optional(),
  custom_audience_info: CustomAudienceGroupSchema.optional(),
  default_dsa_beneficiary: z.string().optional(),
  default_dsa_payor: z.string().optional(),
  direct_deals_tos_accepted: z.boolean().optional(),
  disable_reason: AdAccountDisableReasonSchema.optional(),
  end_advertiser: z.string().optional(),
  end_advertiser_name: z.string().optional(),
  existing_customers: z.array(z.string()).optional(),
  expired_funding_source_details: ExpiredFundingSourceDetailsSchema.optional(),
  extended_credit_invoice_group: ExtendedCreditInvoiceGroupSchema.optional(),
  failed_delivery_checks: z.array(DeliveryCheckSchema).optional(),
  fb_entity: z.number().optional(),
  funding_source: z.number().optional(),
  funding_source_details: FundingSourceDetails.optional(),
  has_migrated_permissions: z.boolean().optional(),
  has_page_authorized_adaccount: z.boolean().optional(),
  io_number: z.string().optional(),
  is_attribution_spec_system_default: z.boolean().optional(),
  is_direct_deals_enabled: z.boolean().optional(),
  is_in_3ds_authorization_enabled_market: z.boolean().optional(),
  is_notifications_enabled: z.boolean().optional(),
  is_personal: z.number().optional(),
  is_prepay_account: z.boolean().optional(),
  is_tax_id_required: z.boolean().optional(),
  line_numbers: z.array(z.number()).optional(),
  media_agency: z.string().optional(),
  min_campaign_group_spend_cap: z.string().optional(),
  min_daily_budget: z.number().optional(),
  name: z.string().optional(),
  offsite_pixels_tos_accepted: z.boolean().optional(),
  owner: z.string().optional(),
  partner: z.string().optional(),
  rf_spec: ReachFrequencySpecSchema.optional(),
  show_checkout_experience: z.boolean().optional(),
  spend_cap: z.string().optional(),
  tax_id: z.string().optional(),
  tax_id_status: z.number().optional(),
  tax_id_type: z.string().optional(),
  timezone_id: z.number().optional(),
  timezone_name: z.string().optional(),
  timezone_offset_hours_utc: z.number().optional(),
  tos_accepted: z.record(z.number()).optional(),
  user_tasks: z.array(z.string()).optional(),
  user_tos_accepted: z.record(z.number()).optional(),
});

export type AdAccountReadResponse = z.infer<typeof AdAccountReadResponseSchema>;
