export type ReceiptCurrency = "UYU" | "USD";

export interface Receipt {
  id: string;
  number: string;
  provider: string;
  amount: number;
  currency: ReceiptCurrency;
  date: Date;
  relatedEntity: string;
  fileUrl?: string;
}

export type ReceiptModalMode = "create" | "edit" | "view";

export interface ReceiptFormValues {
  number: string;
  provider: string;
  amount: string;
  currency: ReceiptCurrency | null;
  date: string;
  relatedEntity: string;
  fileUrl: string;
}

export type ReceiptFormField = keyof ReceiptFormValues;

export interface ReceiptRelatedOption {
  value: string;
  label: string;
  category: string;
}
