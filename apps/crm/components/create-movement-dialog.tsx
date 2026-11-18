"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, CircleDollarSign } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardField, boardControlStyles } from "@/components/dashboard/board/board-field";
import { Calendar } from "@/components/ui/calendar";
import { Dialog } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projects } from "@/lib/data";
import type { Currency, Movement, MovementType } from "@/lib/types";
import { cn } from "@/lib/utils";

const NO_PROJECT = "none";

const createMovementDialogMovementsPage = {
  form: cn("flex flex-col gap-3.5"),
  pair: cn("grid grid-cols-1 gap-3 sm:grid-cols-2"),
  amountPair: cn("grid grid-cols-1 gap-3 sm:grid-cols-[1.3fr_1fr]"),
  dateTrigger: cn("text-left"),
  dateText: cn("flex-1"),
  dateEmpty: cn("text-[var(--tinta-apagada)]"),
  popover: cn("w-auto p-0"),
  textarea: cn(boardControlStyles.input, boardControlStyles.textarea),
  fixedProject: cn(boardControlStyles.shell, "font-semibold"),
  footer: cn("mt-1 flex justify-end gap-2.5"),
  icon: cn("size-4"),
};

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
  const initialProject = fixedProject ?? NO_PROJECT;
  const [date, setDate] = useState<Date>(new Date());
  const [concept, setConcept] = useState("");
  const [type, setType] = useState<MovementType>("income");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState<Currency>("UYU");
  const [amount, setAmount] = useState("");
  const [project, setProject] = useState(initialProject);

  const resetForm = () => {
    setDate(new Date());
    setConcept("");
    setType("income");
    setDescription("");
    setCurrency("UYU");
    setAmount("");
    setProject(initialProject);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      date: format(date, "yyyy-MM-dd"),
      concept,
      type,
      description,
      currency,
      amount: Number.parseFloat(amount),
      project: fixedProject ?? (project === NO_PROJECT ? undefined : project),
    });
    handleOpenChange(false);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <BoardDialogContent
        description="Registra un ingreso o egreso del período."
        title="Nuevo movimiento"
      >
        <form className={createMovementDialogMovementsPage.form} onSubmit={handleSubmit}>
          <div className={createMovementDialogMovementsPage.pair}>
            <BoardField label="Tipo">
              <Select onValueChange={(value) => setType(value as MovementType)} value={type}>
                <SelectTrigger className={boardControlStyles.select}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="expense">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </BoardField>

            <BoardField label="Fecha">
              <Popover>
                <PopoverTrigger asChild={true}>
                  <button
                    className={cn(
                      boardControlStyles.shell,
                      createMovementDialogMovementsPage.dateTrigger,
                    )}
                    type="button"
                  >
                    <CalendarIcon aria-hidden="true" className={boardControlStyles.icon} />
                    <span className={createMovementDialogMovementsPage.dateText}>
                      {format(date, "d MMM yyyy", { locale: es })}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className={createMovementDialogMovementsPage.popover}>
                  <Calendar
                    autoFocus={true}
                    mode="single"
                    onSelect={(selected) => selected && setDate(selected)}
                    selected={date}
                  />
                </PopoverContent>
              </Popover>
            </BoardField>
          </div>

          <BoardField htmlFor="movement-concept" label="Concepto">
            <span className={boardControlStyles.shell}>
              <input
                className={boardControlStyles.input}
                id="movement-concept"
                onChange={(event) => setConcept(event.target.value)}
                placeholder="Ofrenda dominical"
                required={true}
                value={concept}
              />
            </span>
          </BoardField>

          <div className={createMovementDialogMovementsPage.amountPair}>
            <BoardField htmlFor="movement-amount" label="Monto">
              <span className={boardControlStyles.shell}>
                <CircleDollarSign aria-hidden="true" className={boardControlStyles.icon} />
                <input
                  className={boardControlStyles.input}
                  id="movement-amount"
                  min="0"
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                  required={true}
                  step="0.01"
                  type="number"
                  value={amount}
                />
              </span>
            </BoardField>

            <BoardField label="Moneda">
              <Select onValueChange={(value) => setCurrency(value as Currency)} value={currency}>
                <SelectTrigger className={boardControlStyles.select}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UYU">UYU · $U</SelectItem>
                  <SelectItem value="USD">USD · US$</SelectItem>
                </SelectContent>
              </Select>
            </BoardField>
          </div>

          {fixedProject ? (
            <BoardField label="Proyecto">
              <div className={createMovementDialogMovementsPage.fixedProject}>{fixedProject}</div>
            </BoardField>
          ) : (
            <BoardField label="Proyecto (opcional)">
              <Select onValueChange={setProject} value={project}>
                <SelectTrigger className={boardControlStyles.select}>
                  <SelectValue placeholder="Elegir proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROJECT}>Sin proyecto</SelectItem>
                  {projects.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </BoardField>
          )}

          <BoardField htmlFor="movement-description" label="Descripción">
            <span className={boardControlStyles.shell}>
              <textarea
                className={createMovementDialogMovementsPage.textarea}
                id="movement-description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Detalle opcional…"
                value={description}
              />
            </span>
          </BoardField>

          <div className={createMovementDialogMovementsPage.footer}>
            <BoardButton onClick={() => handleOpenChange(false)} variant="ghost">
              Cancelar
            </BoardButton>
            <BoardButton disabled={!concept || !amount} type="submit" variant="primary">
              <Check aria-hidden="true" className={createMovementDialogMovementsPage.icon} />
              Guardar movimiento
            </BoardButton>
          </div>
        </form>
      </BoardDialogContent>
    </Dialog>
  );
}
