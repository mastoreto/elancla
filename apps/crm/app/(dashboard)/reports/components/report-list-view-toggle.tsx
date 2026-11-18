"use client";

import { LayoutGrid, Rows3 } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import type { GeneratedReportsViewMode } from "../types/index";

interface ReportListViewToggleProps {
  value: GeneratedReportsViewMode;
  onChange: (value: GeneratedReportsViewMode) => void;
}

const listLabel = "Lista";
const gridLabel = "Recuadros";

export function ReportListViewToggle({ value, onChange }: ReportListViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue === "GRID" || nextValue === "LIST") {
          onChange(nextValue);
        }
      }}
      variant="outline"
      size="sm"
      aria-label="Cambiar visualización del listado"
    >
      <ToggleGroupItem value="GRID" aria-label="Ver en recuadros" title="Ver en recuadros">
        <LayoutGrid className="size-4" />
        <span className="hidden sm:inline">{gridLabel}</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="LIST" aria-label="Ver en lista" title="Ver en lista">
        <Rows3 className="size-4" />
        <span className="hidden sm:inline">{listLabel}</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
