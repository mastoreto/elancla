export type VoucherCurrency = "UYU" | "USD";
export type VoucherRelationKind = "movement" | "request";

export interface Voucher {
  id: string;
  description: string;
  amount: number;
  currency: VoucherCurrency;
  date: Date;
  responsible: string;
  relatedEntity: string;
  justification?: string;
}

export type VoucherModalMode = "create" | "edit";

export interface VoucherFormValues {
  description: string;
  justification: string;
  amount: string;
  currency: VoucherCurrency;
  date: string;
  responsible: string;
  relatedEntity: string;
}

export type VoucherFormField = keyof VoucherFormValues;

export interface VoucherRelatedOption {
  value: string;
  label: string;
  kind: VoucherRelationKind;
}
