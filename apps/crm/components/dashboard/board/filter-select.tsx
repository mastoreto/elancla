"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { boardControlStyles } from "./board-field";

export interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  /** An empty value shows the placeholder. */
  value: string;
  placeholder?: string;
  options: FilterSelectOption[];
  onValueChange: (value: string) => void;
}

/** Pill-shaped select used in list toolbars. */
export function FilterSelect({
  label,
  value,
  placeholder,
  options,
  onValueChange,
}: FilterSelectProps) {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger aria-label={label} className={boardControlStyles.pill}>
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
  );
}
