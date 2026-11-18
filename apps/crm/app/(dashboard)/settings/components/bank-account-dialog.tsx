"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput, BoardSelect } from "@/components/dashboard/board/board-form";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { BankAccountSetting } from "../types";

const CURRENCY_OPTIONS = [
  { value: "UYU", label: "UYU" },
  { value: "USD", label: "USD" },
];

const bankAccountDialogSettingsPage = {
  form: cn("flex flex-col gap-4"),
  pair: cn("grid grid-cols-1 gap-3.5 sm:grid-cols-2"),
  footer: cn("flex flex-wrap justify-end gap-2.5 pt-1"),
  icon: cn("size-4"),
};

interface BankAccountDraft {
  bank: string;
  branch: string;
  accountNumber: string;
  currency: string;
  owner: string;
}

const EMPTY_DRAFT: BankAccountDraft = {
  bank: "",
  branch: "",
  accountNumber: "",
  currency: "UYU",
  owner: "",
};

interface BankAccountDialogProps {
  open: boolean;
  account: BankAccountSetting | null;
  onOpenChange: (open: boolean) => void;
  onSave: (account: BankAccountSetting) => void;
}

export function BankAccountDialog({ open, account, onOpenChange, onSave }: BankAccountDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <BankAccountForm
        account={account}
        key={account?.id ?? "new"}
        onCancel={() => onOpenChange(false)}
        onSave={onSave}
      />
    </Dialog>
  );
}

interface BankAccountFormProps {
  account: BankAccountSetting | null;
  onCancel: () => void;
  onSave: (account: BankAccountSetting) => void;
}

function BankAccountForm({ account, onCancel, onSave }: BankAccountFormProps) {
  const [draft, setDraft] = useState<BankAccountDraft>(account ?? EMPTY_DRAFT);
  const update = (field: keyof BankAccountDraft, value: string) =>
    setDraft((previous) => ({ ...previous, [field]: value }));
  const isValid = Boolean(draft.bank.trim() && draft.accountNumber.trim());

  const submit = () => {
    if (!isValid) return;
    onSave({
      id: account?.id ?? `account-${draft.bank.trim().toLowerCase()}-${draft.accountNumber.trim()}`,
      bank: draft.bank.trim(),
      branch: draft.branch.trim(),
      accountNumber: draft.accountNumber.trim(),
      currency: draft.currency === "USD" ? "USD" : "UYU",
      owner: draft.owner.trim(),
    });
  };

  return (
    <BoardDialogContent
      description="Cuenta habilitada para operar en el período."
      title={account ? "Editar cuenta bancaria" : "Agregar cuenta bancaria"}
    >
      <form
        className={bankAccountDialogSettingsPage.form}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className={bankAccountDialogSettingsPage.pair}>
          <BoardInput
            id="account-bank"
            label="Banco"
            onChange={(event) => update("bank", event.target.value)}
            placeholder="BROU"
            value={draft.bank}
          />
          <BoardInput
            id="account-branch"
            label="Sucursal"
            onChange={(event) => update("branch", event.target.value)}
            placeholder="Sucursal Centro"
            value={draft.branch}
          />
        </div>
        <BoardInput
          id="account-number"
          label="Cuenta"
          onChange={(event) => update("accountNumber", event.target.value)}
          placeholder="001234567-00001"
          value={draft.accountNumber}
        />
        <div className={bankAccountDialogSettingsPage.pair}>
          <BoardSelect
            id="account-currency"
            label="Moneda"
            onValueChange={(value) => update("currency", value)}
            options={CURRENCY_OPTIONS}
            value={draft.currency}
          />
          <BoardInput
            id="account-owner"
            label="Responsable"
            onChange={(event) => update("owner", event.target.value)}
            placeholder="María García"
            value={draft.owner}
          />
        </div>
        <div className={bankAccountDialogSettingsPage.footer}>
          <BoardButton onClick={onCancel} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton disabled={!isValid} onClick={submit} variant="primary">
            <Check aria-hidden="true" className={bankAccountDialogSettingsPage.icon} />
            Guardar
          </BoardButton>
        </div>
      </form>
    </BoardDialogContent>
  );
}
