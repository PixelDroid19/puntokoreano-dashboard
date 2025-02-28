// src/types/billing.types.ts

export interface CompanyInfo {
  name: string;
  tax_id: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface InvoiceSettings {
  prefix: string;
  start_number: number;
  format: string;
  terms_conditions: string;
}

export interface TaxSettings {
  default_rate: number;
  tax_name: string;
  tax_id_label: string;
}

export interface BillingSettings {
  company_info: CompanyInfo;
  invoice_settings: InvoiceSettings;
  tax_settings: TaxSettings;
}

export type BillingSettingsUpdate = Partial<BillingSettings>;

export interface BillingSettingsResponse {
  success: boolean;
  data: BillingSettings;
  message?: string;
}