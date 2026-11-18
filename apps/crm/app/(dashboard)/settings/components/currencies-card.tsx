"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput, BoardSelect } from "@/components/dashboard/board/board-form";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CurrencyRounding, CurrencySetting } from "../types";

const COLUMNS = "1.2fr 80px 120px 110px 80px";
const HEADERS = ["Moneda", "Símbolo", "Cotización", "Redondeo", "Activa"];
const ROUNDING_LABELS: Record<CurrencyRounding, string> = {
  integer: "Entero",
  decimals: "2 decimales",
};
const ROUNDING_OPTIONS = Object.entries(ROUNDING_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const currenciesCardSettingsPage = {
  card: cn("flex flex-col gap-1 p-5"),
  name: cn("flex min-w-0 flex-col gap-0.5"),
  nameText: cn("font-bold"),
  code: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  status: cn("w-fit"),
  form: cn("flex flex-col gap-4"),
  pair: cn("grid grid-cols-1 gap-3.5 sm:grid-cols-2"),
  footer: cn("flex flex-wrap justify-end gap-2.5 pt-1"),
  icon: cn("size-4"),
};

interface CurrencyDraft {
  name: string;
  code: string;
  symbol: string;
  exchangeRate: string;
  rounding: CurrencyRounding;
}

const EMPTY_DRAFT: CurrencyDraft = {
  name: "",
  code: "",
  symbol: "",
  exchangeRate: "",
  rounding: "decimals",
};

interface CurrenciesCardProps {
  initialCurrencies: CurrencySetting[];
}

export function CurrenciesCard({ initialCurrencies }: CurrenciesCardProps) {
  const [currencies, setCurrencies] = useState(initialCurrencies);
  const [open, setOpen] = useState(false);

  const add = (draft: CurrencyDraft) => {
    setCurrencies((previous) => [
      ...previous,
      { ...draft, code: draft.code.toUpperCase(), active: true },
    ]);
    setOpen(false);
  };

  return (
    <BoardCard className={currenciesCardSettingsPage.card}>
      <BoardCardHeader
        action={
          <BoardButton onClick={() => setOpen(true)} size="sm" variant="soft">
            <Plus aria-hidden="true" className={currenciesCardSettingsPage.icon} />
            Agregar
          </BoardButton>
        }
        subtitle="Equivalencias de referencia y reglas de redondeo"
        title="Monedas"
      />
      <BoardTableHead columns={COLUMNS} labels={HEADERS} />
      <BoardTableList>
        {currencies.map((currency) => (
          <BoardTableRow columns={COLUMNS} key={currency.code}>
            <div className={currenciesCardSettingsPage.name}>
              <span className={currenciesCardSettingsPage.nameText}>{currency.name}</span>
              <span className={currenciesCardSettingsPage.code}>{currency.code}</span>
            </div>
            <span>{currency.symbol}</span>
            <span>{currency.exchangeRate}</span>
            <span>{ROUNDING_LABELS[currency.rounding]}</span>
            <StatusPill
              className={currenciesCardSettingsPage.status}
              tone={currency.active ? "green" : "ink"}
            >
              {currency.active ? "Sí" : "No"}
            </StatusPill>
          </BoardTableRow>
        ))}
      </BoardTableList>
      <Dialog onOpenChange={setOpen} open={open}>
        <CurrencyForm key={String(open)} onAdd={add} onCancel={() => setOpen(false)} />
      </Dialog>
    </BoardCard>
  );
}

interface CurrencyFormProps {
  onAdd: (draft: CurrencyDraft) => void;
  onCancel: () => void;
}

function CurrencyForm({ onAdd, onCancel }: CurrencyFormProps) {
  const [draft, setDraft] = useState<CurrencyDraft>(EMPTY_DRAFT);
  const update = <K extends keyof CurrencyDraft>(field: K, value: CurrencyDraft[K]) =>
    setDraft((previous) => ({ ...previous, [field]: value }));
  const isValid = Boolean(draft.name.trim() && draft.code.trim() && draft.symbol.trim());

  const submit = () => {
    if (isValid) onAdd(draft);
  };

  return (
    <BoardDialogContent
      description="Define la equivalencia de referencia y cómo se redondea."
      title="Agregar moneda"
    >
      <form
        className={currenciesCardSettingsPage.form}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <BoardInput
          id="currency-name"
          label="Nombre"
          onChange={(event) => update("name", event.target.value)}
          placeholder="Euro"
          value={draft.name}
        />
        <div className={currenciesCardSettingsPage.pair}>
          <BoardInput
            id="currency-code"
            label="Código"
            maxLength={3}
            onChange={(event) => update("code", event.target.value)}
            placeholder="EUR"
            value={draft.code}
          />
          <BoardInput
            id="currency-symbol"
            label="Símbolo"
            onChange={(event) => update("symbol", event.target.value)}
            placeholder="€"
            value={draft.symbol}
          />
        </div>
        <div className={currenciesCardSettingsPage.pair}>
          <BoardInput
            id="currency-rate"
            label="Cotización"
            onChange={(event) => update("exchangeRate", event.target.value)}
            placeholder="42,50"
            value={draft.exchangeRate}
          />
          <BoardSelect
            id="currency-rounding"
            label="Redondeo"
            onValueChange={(value) => update("rounding", value as CurrencyRounding)}
            options={ROUNDING_OPTIONS}
            value={draft.rounding}
          />
        </div>
        <div className={currenciesCardSettingsPage.footer}>
          <BoardButton onClick={onCancel} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton disabled={!isValid} onClick={submit} variant="primary">
            <Check aria-hidden="true" className={currenciesCardSettingsPage.icon} />
            Agregar moneda
          </BoardButton>
        </div>
      </form>
    </BoardDialogContent>
  );
}
