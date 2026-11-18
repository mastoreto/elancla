export type BudgetCurrency = "UYU" | "USD";

export type Budget = {
  id: string;
  name: string;
  ministry?: string;
  project?: string;
  currency: BudgetCurrency;
  totalAmount: number;
  usedAmount: number;
  startDate: Date;
  endDate: Date;
};

export type BudgetOwnerType = "MINISTRY" | "PROJECT";

export type BudgetFormMode = "create" | "edit";

export type BudgetFormValues = {
  name: string;
  ownerType: BudgetOwnerType | null;
  ministry: string;
  project: string;
  currency: BudgetCurrency | null;
  totalAmount: string;
  startDate: string;
  endDate: string;
};

export type BudgetFormField = keyof BudgetFormValues;

export type BudgetSelectOption = {
  value: string;
  label: string;
};

export type BudgetSummaryValues = {
  totalBudget: string;
  totalUsed: string;
  totalAvailable: string;
};
