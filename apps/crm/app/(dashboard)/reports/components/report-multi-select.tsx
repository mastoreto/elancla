import { ChevronsUpDown, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const reportMultiSelectReportsPage = {
  value: cn("truncate"),
  trigger: cn("h-auto min-h-9 w-full justify-between px-3 py-2 text-left"),
  options: cn("max-h-60 space-y-3 overflow-y-auto px-4 py-3"),
  option: cn(
    "flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-border/60 hover:bg-muted/40",
  ),
  footer: cn("flex items-center justify-between border-t border-border/60 px-4 py-3"),
  chip: cn("gap-1 rounded-full border border-border/60 bg-muted/70 px-3 py-1"),
  chipRemove: cn("rounded-full text-muted-foreground transition-colors hover:text-foreground"),
};

interface ReportMultiSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

function getSelectedLabel(selectedValues: string[], placeholder: string) {
  if (selectedValues.length === 0) {
    return placeholder;
  }

  if (selectedValues.length <= 2) {
    return selectedValues.join(", ");
  }

  return `${selectedValues.length} seleccionados`;
}

export function ReportMultiSelect({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
}: ReportMultiSelectProps) {
  const helperText = "Selecciona una o más opciones";
  const availabilityText = "Disponible para el reporte";
  const selectedText = `${selectedValues.length} seleccionados`;
  const clearText = "Limpiar";

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((item) => item !== value));
      return;
    }

    onChange([...selectedValues, value]);
  };

  const removeValue = (value: string) => {
    onChange(selectedValues.filter((item) => item !== value));
  };

  return (
    <Field className="gap-3">
      <FieldLabel>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger asChild={true}>
          <Button type="button" variant="outline" className={reportMultiSelectReportsPage.trigger}>
            <span
              className={cn(
                reportMultiSelectReportsPage.value,
                selectedValues.length === 0 && "text-muted-foreground",
              )}
            >
              {getSelectedLabel(selectedValues, placeholder)}
            </span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[22rem] max-w-[calc(100vw-2rem)] p-0">
          <div className="border-b border-border/60 px-4 py-3">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{helperText}</p>
          </div>

          <div className={reportMultiSelectReportsPage.options}>
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleValue(option)}
                aria-pressed={selectedValues.includes(option)}
                className={reportMultiSelectReportsPage.option}
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{option}</p>
                  <p className="text-xs text-muted-foreground">{availabilityText}</p>
                </div>
                <Checkbox
                  checked={selectedValues.includes(option)}
                  onCheckedChange={undefined}
                  className="pointer-events-none"
                  aria-label={`Seleccionar ${option}`}
                />
              </button>
            ))}
          </div>

          <div className={reportMultiSelectReportsPage.footer}>
            <span className="text-xs text-muted-foreground">{selectedText}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              disabled={selectedValues.length === 0}
            >
              {clearText}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {selectedValues.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((value) => (
            <Badge key={value} variant="secondary" className={reportMultiSelectReportsPage.chip}>
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                className={reportMultiSelectReportsPage.chipRemove}
                aria-label={`Quitar ${value}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </Field>
  );
}
