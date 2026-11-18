"use client";

import { Landmark, PencilLine, Plus } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { IconBubble, type IconBubbleTone } from "@/components/dashboard/board/icon-bubble";
import { RowIconButton } from "@/components/dashboard/board/row-icon-button";
import { cn } from "@/lib/utils";
import type { BankAccountSetting } from "../types";
import { BankAccountDialog } from "./bank-account-dialog";

const COLUMNS = "1fr 1.2fr 80px 1.2fr 56px";
const HEADERS = ["Banco", "Cuenta", "Moneda", "Responsable", ""];
const BUBBLE_TONES: IconBubbleTone[] = ["rose", "gold", "green", "ink"];

const bankAccountsCardSettingsPage = {
  card: cn("flex flex-col gap-1 p-5"),
  bank: cn("flex min-w-0 items-center gap-3"),
  bubble: cn("size-[38px]"),
  bankText: cn("flex min-w-0 flex-col gap-0.5"),
  bankName: cn("font-bold"),
  branch: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  actions: cn("flex justify-end gap-1.5"),
  icon: cn("size-3.5"),
  buttonIcon: cn("size-4"),
  bubbleIcon: cn("size-[17px]"),
};

interface BankAccountsCardProps {
  initialAccounts: BankAccountSetting[];
}

export function BankAccountsCard({ initialAccounts }: BankAccountsCardProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  // `undefined` = closed, `null` = adding, otherwise the account being edited.
  const [editing, setEditing] = useState<BankAccountSetting | null | undefined>(undefined);

  const save = (account: BankAccountSetting) => {
    setAccounts((previous) =>
      previous.some((candidate) => candidate.id === account.id)
        ? previous.map((candidate) => (candidate.id === account.id ? account : candidate))
        : [...previous, account],
    );
    setEditing(undefined);
  };

  return (
    <BoardCard className={bankAccountsCardSettingsPage.card}>
      <BoardCardHeader
        action={
          <BoardButton onClick={() => setEditing(null)} size="sm" variant="soft">
            <Plus aria-hidden="true" className={bankAccountsCardSettingsPage.buttonIcon} />
            Agregar
          </BoardButton>
        }
        subtitle="Cuentas habilitadas para operar en el período"
        title="Cuentas bancarias"
      />
      <BoardTableHead columns={COLUMNS} labels={HEADERS} />
      <BoardTableList>
        {accounts.map((account, index) => (
          <BoardTableRow columns={COLUMNS} key={account.id}>
            <div className={bankAccountsCardSettingsPage.bank}>
              <IconBubble
                className={bankAccountsCardSettingsPage.bubble}
                tone={BUBBLE_TONES[index % BUBBLE_TONES.length]}
              >
                <Landmark aria-hidden="true" className={bankAccountsCardSettingsPage.bubbleIcon} />
              </IconBubble>
              <div className={bankAccountsCardSettingsPage.bankText}>
                <span className={bankAccountsCardSettingsPage.bankName}>{account.bank}</span>
                <span className={bankAccountsCardSettingsPage.branch}>{account.branch}</span>
              </div>
            </div>
            <span>{account.accountNumber}</span>
            <span>{account.currency}</span>
            <span>{account.owner}</span>
            <div className={bankAccountsCardSettingsPage.actions}>
              <RowIconButton
                label={`Editar ${account.bank} ${account.accountNumber}`}
                onClick={() => setEditing(account)}
              >
                <PencilLine aria-hidden="true" className={bankAccountsCardSettingsPage.icon} />
              </RowIconButton>
            </div>
          </BoardTableRow>
        ))}
      </BoardTableList>
      <BankAccountDialog
        account={editing ?? null}
        onOpenChange={(open) => setEditing(open ? (editing ?? null) : undefined)}
        onSave={save}
        open={editing !== undefined}
      />
    </BoardCard>
  );
}
