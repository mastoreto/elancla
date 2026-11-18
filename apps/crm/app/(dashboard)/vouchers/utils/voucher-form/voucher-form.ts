import type { Voucher, VoucherFormValues, VoucherRelatedOption } from "../../types";

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string, fallback: Date) {
  if (!value) {
    return fallback;
  }

  return new Date(`${value}T00:00:00`);
}

export function getRelatedEntityLabel(option: VoucherRelatedOption) {
  if (option.kind === "movement") {
    return `Movimiento · ${option.label}`;
  }

  return `Solicitud · ${option.label}`;
}

export function getRelatedEntityValue(
  relatedEntity: string,
  relatedOptions: VoucherRelatedOption[],
) {
  const valueMatch = relatedOptions.find((option) => option.value === relatedEntity);

  if (valueMatch) {
    return valueMatch.value;
  }

  const labelMatch = relatedOptions.find(
    (option) => getRelatedEntityLabel(option) === relatedEntity,
  );

  return labelMatch?.value ?? relatedEntity;
}

export function getRelatedEntityDisplay(value: string, relatedOptions: VoucherRelatedOption[]) {
  const option = relatedOptions.find((item) => item.value === value);

  if (!option) {
    return value;
  }

  return getRelatedEntityLabel(option);
}

export function createDefaultFormValues(): VoucherFormValues {
  return {
    description: "",
    justification: "",
    amount: "",
    currency: "UYU",
    date: formatDateInput(new Date()),
    responsible: "",
    relatedEntity: "",
  };
}

export function mapVoucherToFormValues(
  voucher: Voucher,
  relatedOptions: VoucherRelatedOption[],
): VoucherFormValues {
  return {
    description: voucher.description,
    justification: voucher.justification ?? "",
    amount: String(voucher.amount),
    currency: voucher.currency,
    date: formatDateInput(voucher.date),
    responsible: voucher.responsible,
    relatedEntity: getRelatedEntityValue(voucher.relatedEntity, relatedOptions),
  };
}

export function mapFormValuesToVoucher(
  values: VoucherFormValues,
  id: string,
  relatedOptions: VoucherRelatedOption[],
): Voucher {
  const fallbackDate = new Date();

  return {
    id,
    description: values.description,
    justification: values.justification || undefined,
    amount: Number(values.amount) || 0,
    currency: values.currency,
    date: parseDateInput(values.date, fallbackDate),
    responsible: values.responsible,
    relatedEntity: getRelatedEntityDisplay(values.relatedEntity, relatedOptions),
  };
}
