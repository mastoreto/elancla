"use client";

import { Handshake } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput, BoardSelect, BoardTextarea } from "@/components/dashboard/board/board-form";
import { Dialog } from "@/components/ui/dialog";
import { ministries } from "@/lib/data";
import { cn } from "@/lib/utils";
import { type LendFormErrors, lendFormSchema } from "../schema";

interface InventoryLendDialogProps {
  itemName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once the loan passes validation. */
  onLent: () => void;
}

const EMPTY_LEND_FORM = { borrower: "", from: "", returnOn: "", note: "" };

const BORROWER_OPTIONS = ministries.map((ministry) => ({
  value: ministry.name,
  label: ministry.name,
}));

const inventoryLendDialogInventoryPage = {
  fields: cn("flex flex-col gap-4"),
  dates: cn("grid grid-cols-1 gap-3 sm:grid-cols-2"),
  footer: cn("flex justify-end gap-2.5"),
};

export function InventoryLendDialog({
  itemName,
  open,
  onOpenChange,
  onLent,
}: InventoryLendDialogProps) {
  const [values, setValues] = useState(EMPTY_LEND_FORM);
  const [errors, setErrors] = useState<LendFormErrors>({});

  const update = (field: keyof typeof EMPTY_LEND_FORM, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  // Seed-data screen: validating and closing stands in for registering the loan.
  const submit = () => {
    const result = lendFormSchema.safeParse(values);
    if (!result.success) {
      const next: LendFormErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof LendFormErrors] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setValues(EMPTY_LEND_FORM);
    onLent();
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <BoardDialogContent description={itemName} title="Prestar ítem">
        <div className={inventoryLendDialogInventoryPage.fields}>
          <BoardSelect
            error={errors.borrower}
            id="lend-borrower"
            label="Se lo presta a *"
            onValueChange={(value) => update("borrower", value)}
            options={BORROWER_OPTIONS}
            placeholder="Elegir persona o ministerio"
            value={values.borrower}
          />
          <div className={inventoryLendDialogInventoryPage.dates}>
            <BoardInput
              error={errors.from}
              id="lend-from"
              label="Desde"
              onChange={(event) => update("from", event.target.value)}
              type="date"
              value={values.from}
            />
            <BoardInput
              error={errors.returnOn}
              id="lend-return"
              label="Devuelve el"
              onChange={(event) => update("returnOn", event.target.value)}
              type="date"
              value={values.returnOn}
            />
          </div>
          <BoardTextarea
            id="lend-note"
            label="Nota"
            onChange={(event) => update("note", event.target.value)}
            placeholder="Condiciones, accesorios incluidos…"
            value={values.note}
          />
        </div>
        <div className={inventoryLendDialogInventoryPage.footer}>
          <BoardButton onClick={() => onOpenChange(false)} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton onClick={submit} variant="primary">
            <Handshake aria-hidden="true" className="size-4" />
            Registrar préstamo
          </BoardButton>
        </div>
      </BoardDialogContent>
    </Dialog>
  );
}
