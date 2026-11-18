"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { projects } from "@/lib/data";
import type { Currency, Movement, MovementType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CreateMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (movement: Omit<Movement, "id">) => void;
  fixedProject?: string;
}

export function CreateMovementDialog({
  open,
  onOpenChange,
  onSubmit,
  fixedProject,
}: CreateMovementDialogProps) {
  const initialProjectValue = fixedProject ?? "none";
  const [date, setDate] = useState<Date>(new Date());
  const [concept, setConcept] = useState("");
  const [type, setType] = useState<MovementType>("income");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState<Currency>("UYU");
  const [amount, setAmount] = useState("");
  const [project, setProject] = useState<string>(initialProjectValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setDate(new Date());
    setConcept("");
    setType("income");
    setDescription("");
    setCurrency("UYU");
    setAmount("");
    setProject(initialProjectValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSubmit({
      date: format(date, "yyyy-MM-dd"),
      concept,
      type,
      description,
      currency,
      amount: Number.parseFloat(amount),
      project: fixedProject ?? (project === "none" ? undefined : project),
    });

    setIsSubmitting(false);
    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Movimiento</DialogTitle>
          <DialogDescription>Añade un nuevo ingreso o gasto a la tesoería</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <Field>
            <FieldLabel>Tipo</FieldLabel>
            <ToggleGroup
              type="single"
              value={type}
              onValueChange={(value) => value && setType(value as MovementType)}
              className="justify-start"
            >
              <ToggleGroupItem
                value="income"
                className={cn(
                  "data-[state=on]:bg-income/10 data-[state=on]:text-income data-[state=on]:border-income/30",
                  "border",
                )}
              >
                Ingreso
              </ToggleGroupItem>
              <ToggleGroupItem
                value="expense"
                className={cn(
                  "data-[state=on]:bg-expense/10 data-[state=on]:text-expense data-[state=on]:border-expense/30",
                  "border",
                )}
              >
                Gasto
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>

          {/* Date */}
          <Field>
            <FieldLabel>Fecha</FieldLabel>
            <Popover>
              <PopoverTrigger asChild={true}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {date ? format(date, "PPP") : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus={true}
                />
              </PopoverContent>
            </Popover>
          </Field>

          {/* Concept */}
          <Field>
            <FieldLabel htmlFor="concept">Concepto</FieldLabel>
            <Input
              id="concept"
              placeholder="p. ej., Ofrenda Dominical"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              required={true}
            />
          </Field>

          {/* Description */}
          <Field>
            <FieldLabel htmlFor="description">Descripción</FieldLabel>
            <Textarea
              id="description"
              placeholder="Detalles adicionales sobre este movimiento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </Field>

          {/* Currency & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Moneda</FieldLabel>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UYU">UYU - Peso Uruguayo</SelectItem>
                  <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="amount">Cantidad</FieldLabel>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required={true}
              />
            </Field>
          </div>

          {/* Project */}
          {fixedProject ? (
            <Field>
              <FieldLabel>Proyecto</FieldLabel>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
                {fixedProject}
              </div>
            </Field>
          ) : (
            <Field>
              <FieldLabel>Proyecto (opcional)</FieldLabel>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin proyecto</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !concept || !amount}
              className={cn(
                type === "income"
                  ? "bg-income hover:bg-income/90 text-income-foreground"
                  : "bg-expense hover:bg-expense/90 text-expense-foreground",
              )}
            >
              {isSubmitting ? "Guardando..." : `Añadir ${type === "income" ? "ingreso" : "gasto"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
