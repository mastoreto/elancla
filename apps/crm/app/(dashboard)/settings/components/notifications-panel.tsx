"use client";

import { CircleDollarSign } from "lucide-react";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardInput, BoardSelect } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import { SUMMARY_HOURS } from "../data/finance";
import type { NotificationRule, NotificationSettings, SettingsSelectOption } from "../types";
import { SettingsCheck } from "./settings-check";
import { SettingsToggle } from "./settings-toggle";

const RULE_COLUMNS = "grid-cols-[1fr_90px_90px]";

const notificationsPanelSettingsPage = {
  layout: cn("grid items-start gap-[18px] lg:grid-cols-[1.5fr_1fr]"),
  aside: cn("flex flex-col gap-[18px]"),
  head: cn("grid gap-3.5 px-1 py-3 text-xs font-bold text-[var(--tinta-suave)]", RULE_COLUMNS),
  headCenter: cn("text-center"),
  rule: cn("grid items-center gap-3.5 border-b border-border px-1 py-4", RULE_COLUMNS),
  ruleText: cn("flex flex-col gap-[3px]"),
  ruleTitle: cn("text-sm font-semibold"),
  ruleHint: cn("text-[12.5px] leading-snug text-[var(--tinta-apagada)]"),
  cell: cn("flex justify-center"),
  stack: cn("flex flex-col gap-3"),
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
  switchRow: cn("flex items-center gap-3.5 pb-3.5"),
  switchText: cn("flex flex-1 flex-col gap-0.5"),
};

interface NotificationsPanelProps {
  value: NotificationSettings;
  currencyOptions: SettingsSelectOption[];
  onChange: (value: NotificationSettings) => void;
}

export function NotificationsPanel({ value, currencyOptions, onChange }: NotificationsPanelProps) {
  const updateRule = (id: string, channel: "inApp" | "email", enabled: boolean) =>
    onChange({
      ...value,
      rules: value.rules.map((rule: NotificationRule) =>
        rule.id === id ? { ...rule, [channel]: enabled } : rule,
      ),
    });

  return (
    <div className={notificationsPanelSettingsPage.layout}>
      <BoardCard className="p-6">
        <BoardCardHeader
          subtitle="Reglas habilitadas para alertas del sistema"
          title="Notificaciones"
        />
        <div className={notificationsPanelSettingsPage.head}>
          <span>Aviso</span>
          <span className={notificationsPanelSettingsPage.headCenter}>En la app</span>
          <span className={notificationsPanelSettingsPage.headCenter}>Por correo</span>
        </div>
        {value.rules.map((rule) => (
          <div className={notificationsPanelSettingsPage.rule} key={rule.id}>
            <div className={notificationsPanelSettingsPage.ruleText}>
              <b className={notificationsPanelSettingsPage.ruleTitle}>{rule.title}</b>
              <span className={notificationsPanelSettingsPage.ruleHint}>{rule.description}</span>
            </div>
            <div className={notificationsPanelSettingsPage.cell}>
              <SettingsCheck
                checked={rule.inApp}
                label={`${rule.title}: en la app`}
                onCheckedChange={(checked) => updateRule(rule.id, "inApp", checked)}
              />
            </div>
            <div className={notificationsPanelSettingsPage.cell}>
              <SettingsCheck
                checked={rule.email}
                label={`${rule.title}: por correo`}
                onCheckedChange={(checked) => updateRule(rule.id, "email", checked)}
              />
            </div>
          </div>
        ))}
      </BoardCard>

      <div className={notificationsPanelSettingsPage.aside}>
        <BoardCard className="p-6">
          <BoardCardHeader
            subtitle="Monto desde el cual una solicitud pide aprobación"
            title="Umbral de aprobación"
          />
          <div className={notificationsPanelSettingsPage.stack}>
            <BoardInput
              icon={
                <CircleDollarSign
                  aria-hidden="true"
                  className={notificationsPanelSettingsPage.icon}
                />
              }
              id="threshold-amount"
              inputMode="numeric"
              label="Monto mínimo"
              onChange={(event) => onChange({ ...value, threshold: event.target.value })}
              value={value.threshold}
            />
            <BoardSelect
              id="threshold-currency"
              label="Moneda"
              onValueChange={(thresholdCurrency) => onChange({ ...value, thresholdCurrency })}
              options={currencyOptions}
              value={value.thresholdCurrency}
            />
          </div>
        </BoardCard>

        <BoardCard className="p-6">
          <BoardCardHeader subtitle="Cuándo llega el aviso de cierre" title="Resumen diario" />
          <div className={notificationsPanelSettingsPage.switchRow}>
            <div className={notificationsPanelSettingsPage.switchText}>
              <b className={notificationsPanelSettingsPage.ruleTitle}>Enviar resumen diario</b>
              <span className={notificationsPanelSettingsPage.ruleHint}>
                A tesorería a las {value.summaryHour}.
              </span>
            </div>
            <SettingsToggle
              checked={value.dailySummary}
              label="Enviar resumen diario"
              onCheckedChange={(dailySummary) => onChange({ ...value, dailySummary })}
              size="large"
            />
          </div>
          <BoardSelect
            disabled={!value.dailySummary}
            id="summary-hour"
            label="Hora de envío"
            onValueChange={(summaryHour) => onChange({ ...value, summaryHour })}
            options={SUMMARY_HOURS.map((hour) => ({ value: hour, label: hour }))}
            value={value.summaryHour}
          />
        </BoardCard>
      </div>
    </div>
  );
}
