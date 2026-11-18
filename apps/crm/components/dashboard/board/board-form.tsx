"use client";

import type * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { BoardField, boardControlStyles } from "./board-field";

const boardFormDashboardPage = {
  card: cn("mx-auto w-full max-w-[900px] rounded-[28px] bg-card p-[30px] shadow-(--sombra)"),
  header: cn("mb-3.5 flex flex-col gap-[3px]"),
  title: cn("font-display text-[21px] font-medium tracking-tight"),
  subtitle: cn("text-[13px] text-[var(--tinta-apagada)]"),
  sections: cn("flex flex-col gap-[22px]"),
  section: cn("flex flex-col gap-4"),
  divider: cn("h-px bg-border"),
  columns2: cn("grid grid-cols-1 gap-3 sm:grid-cols-2"),
  columns3: cn("grid grid-cols-1 gap-3 sm:grid-cols-3"),
  footer: cn("mt-[26px] flex flex-wrap justify-end gap-2.5 border-t border-border pt-5"),
  hint: cn("text-xs text-[var(--tinta-apagada)]"),
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
  switchRow: cn("flex items-center gap-3.5"),
  switchText: cn("flex flex-1 flex-col gap-0.5"),
  switchTitle: cn("text-sm font-semibold"),
  switchHint: cn("text-[12.5px] leading-snug text-[var(--tinta-apagada)]"),
  switchControl: cn(
    "h-7 w-[46px] border-0 shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)]",
    "data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary",
    "[&>span]:ml-[3px] [&>span]:size-[22px] [&>span]:bg-white [&>span]:shadow-[0_2px_4px_rgba(42,21,26,0.25)]",
  ),
  error: cn("text-xs font-semibold text-primary"),
};

/** White 900 px card that wraps a create/edit form page. */
export function BoardFormCard({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(boardFormDashboardPage.card, className)}>
      <header className={boardFormDashboardPage.header}>
        <h2 className={boardFormDashboardPage.title}>{title}</h2>
        {subtitle ? <p className={boardFormDashboardPage.subtitle}>{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function BoardFormSections({ children }: { children: React.ReactNode }) {
  return <div className={boardFormDashboardPage.sections}>{children}</div>;
}

export function BoardFormSection({ children }: { children: React.ReactNode }) {
  return <div className={boardFormDashboardPage.section}>{children}</div>;
}

export function BoardFormDivider() {
  return <div aria-hidden="true" className={boardFormDashboardPage.divider} />;
}

export function BoardFormRow({
  columns = 2,
  children,
}: {
  columns?: 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <div
      className={columns === 2 ? boardFormDashboardPage.columns2 : boardFormDashboardPage.columns3}
    >
      {children}
    </div>
  );
}

export function BoardFormFooter({ children }: { children: React.ReactNode }) {
  return <div className={boardFormDashboardPage.footer}>{children}</div>;
}

interface FieldChromeProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

interface BoardInputProps
  extends FieldChromeProps,
    Omit<React.ComponentProps<"input">, "className" | "id"> {}

/** Labelled 48 px input shell with an optional leading icon. */
export function BoardInput({ label, id, error, hint, icon, ...props }: BoardInputProps) {
  return (
    <BoardField htmlFor={id} label={label}>
      <span className={boardControlStyles.shell}>
        {icon}
        <input
          aria-invalid={Boolean(error)}
          className={boardControlStyles.input}
          id={id}
          {...props}
        />
      </span>
      {error ? <span className={boardFormDashboardPage.error}>{error}</span> : null}
      {hint ? <span className={boardFormDashboardPage.hint}>{hint}</span> : null}
    </BoardField>
  );
}

interface BoardTextareaProps
  extends FieldChromeProps,
    Omit<React.ComponentProps<"textarea">, "className" | "id"> {}

export function BoardTextarea({ label, id, error, hint, ...props }: BoardTextareaProps) {
  return (
    <BoardField htmlFor={id} label={label}>
      <span className={cn(boardControlStyles.shell, "items-start")}>
        <textarea
          aria-invalid={Boolean(error)}
          className={cn(boardControlStyles.input, boardControlStyles.textarea)}
          id={id}
          {...props}
        />
      </span>
      {error ? <span className={boardFormDashboardPage.error}>{error}</span> : null}
      {hint ? <span className={boardFormDashboardPage.hint}>{hint}</span> : null}
    </BoardField>
  );
}

export interface BoardSelectOption {
  value: string;
  label: string;
}

interface BoardSelectProps extends Omit<FieldChromeProps, "icon"> {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly BoardSelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

/** Labelled select that matches the board's 48 px controls. */
export function BoardSelect({
  label,
  id,
  value,
  onValueChange,
  options,
  placeholder,
  error,
  hint,
  disabled,
}: BoardSelectProps) {
  return (
    <BoardField htmlFor={id} label={label}>
      <Select disabled={disabled} onValueChange={onValueChange} value={value}>
        <SelectTrigger aria-invalid={Boolean(error)} className={boardControlStyles.select} id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <span className={boardFormDashboardPage.error}>{error}</span> : null}
      {hint ? <span className={boardFormDashboardPage.hint}>{hint}</span> : null}
    </BoardField>
  );
}

interface BoardSwitchRowProps {
  title: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function BoardSwitchRow({ title, hint, checked, onCheckedChange }: BoardSwitchRowProps) {
  return (
    <div className={boardFormDashboardPage.switchRow}>
      <div className={boardFormDashboardPage.switchText}>
        <b className={boardFormDashboardPage.switchTitle}>{title}</b>
        {hint ? <span className={boardFormDashboardPage.switchHint}>{hint}</span> : null}
      </div>
      <Switch
        aria-label={title}
        checked={checked}
        className={boardFormDashboardPage.switchControl}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

export { boardFormDashboardPage as boardFormStyles };
