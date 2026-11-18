"use client";

import { HandCoins } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type LendFormErrors, lendFormSchema } from "../schema";

interface InventoryLendDialogProps {
  itemName: string;
}

const EMPTY_LEND_FORM = { borrower: "", from: "", returnOn: "", note: "" };

const inventoryLendDialogInventoryPage = {
  fields: cn("grid gap-4"),
  dates: cn("grid gap-4 sm:grid-cols-2"),
};

export function InventoryLendDialog({ itemName }: InventoryLendDialogProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY_LEND_FORM);
  const [errors, setErrors] = useState<LendFormErrors>({});

  const update = (field: keyof typeof EMPTY_LEND_FORM, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  // Seed-data screen: closing the dialog stands in for registering the loan.
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
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild={true}>
        <Button type="button" variant="outline">
          <HandCoins aria-hidden="true" />
          Prestar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prestar ítem</DialogTitle>
          <DialogDescription>{itemName}</DialogDescription>
        </DialogHeader>
        <div className={inventoryLendDialogInventoryPage.fields}>
          <Field>
            <FieldLabel htmlFor="lend-borrower">Se lo presta a *</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.borrower)}
              id="lend-borrower"
              onChange={(event) => update("borrower", event.target.value)}
              placeholder="Nombre de la persona o ministerio"
              value={values.borrower}
            />
            {errors.borrower ? <FieldError>{errors.borrower}</FieldError> : null}
          </Field>
          <div className={inventoryLendDialogInventoryPage.dates}>
            <Field>
              <FieldLabel htmlFor="lend-from">Desde *</FieldLabel>
              <Input
                aria-invalid={Boolean(errors.from)}
                id="lend-from"
                onChange={(event) => update("from", event.target.value)}
                type="date"
                value={values.from}
              />
              {errors.from ? <FieldError>{errors.from}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="lend-return">Devuelve el *</FieldLabel>
              <Input
                aria-invalid={Boolean(errors.returnOn)}
                id="lend-return"
                onChange={(event) => update("returnOn", event.target.value)}
                type="date"
                value={values.returnOn}
              />
              {errors.returnOn ? <FieldError>{errors.returnOn}</FieldError> : null}
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="lend-note">Nota</FieldLabel>
            <Textarea
              id="lend-note"
              onChange={(event) => update("note", event.target.value)}
              rows={2}
              value={values.note}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} type="button" variant="ghost">
            Cancelar
          </Button>
          <Button onClick={submit} type="button">
            Registrar préstamo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
