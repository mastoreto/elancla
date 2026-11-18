import { describe, expect, test } from "bun:test";
import type { VoucherRelatedOption } from "../../types";
import {
  createDefaultFormValues,
  getRelatedEntityDisplay,
  mapFormValuesToVoucher,
  mapVoucherToFormValues,
} from "./voucher-form";

const options: VoucherRelatedOption[] = [
  { value: "movement-x", label: "Refrigerios", kind: "movement" },
];

describe("voucher form mapping", () => {
  test("prefixes the related option with its kind", () => {
    expect(getRelatedEntityDisplay("movement-x", options)).toBe("Movimiento · Refrigerios");
  });

  test("round-trips a voucher through the form values", () => {
    const values = {
      ...createDefaultFormValues(),
      description: "Taxi",
      amount: "300",
      relatedEntity: "movement-x",
    };
    const voucher = mapFormValuesToVoucher(values, "v1", options);
    expect(voucher.relatedEntity).toBe("Movimiento · Refrigerios");
    expect(mapVoucherToFormValues(voucher, options).relatedEntity).toBe("movement-x");
  });
});
