"use client";

import { format } from "date-fns";
import { AlertTriangle, CalendarIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { leaders, ministries } from "@/lib/data";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

const requestFormModalRequestsPage = {
  triggerIcon: cn("mr-2 size-4"),
  content: cn("max-w-lg"),
  fields: cn("grid gap-4 py-4"),
  field: cn("grid gap-2"),
  dateTrigger: cn("w-full justify-start text-left font-normal"),
  dateTriggerEmpty: cn("text-muted-foreground"),
  dateIcon: cn("mr-2 size-4"),
  popover: cn("w-auto p-0"),
  hint: cn("text-xs text-muted-foreground"),
  pair: cn("grid grid-cols-2 gap-4"),
  triple: cn("grid grid-cols-3 gap-4"),
  wideField: cn("col-span-2 grid gap-2"),
  alert: cn("border-oro bg-warning-surface text-warning"),
  alertIcon: cn("size-4"),
};

interface RequestFormModalProps {
  onSubmit: (data: {
    date: Date;
    concept: string;
    description: string;
    ministry: string;
    leader: string;
    currency: Currency;
    amount: number;
  }) => void;
}

export function RequestFormModal({ onSubmit }: RequestFormModalProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [concept, setConcept] = useState("");
  const [description, setDescription] = useState("");
  const [ministry, setMinistry] = useState("");
  const [leader, setLeader] = useState("");
  const [currency, setCurrency] = useState<Currency>("UYU");
  const [amount, setAmount] = useState("");
  const [exceedsBudget, setExceedsBudget] = useState(false);

  const selectedMinistry = ministries.find((m) => m.id === ministry);
  const ministryLeaders = leaders.filter((l) => l.ministryId === ministry);

  useEffect(() => {
    if (selectedMinistry && amount) {
      const numAmount = Number.parseFloat(amount);
      if (currency === selectedMinistry.budgetCurrency) {
        setExceedsBudget(numAmount > selectedMinistry.budget);
      } else {
        // Simple conversion approximation
        const usdToUyu = 42;
        if (currency === "USD" && selectedMinistry.budgetCurrency === "UYU") {
          setExceedsBudget(numAmount * usdToUyu > selectedMinistry.budget);
        } else if (currency === "UYU" && selectedMinistry.budgetCurrency === "USD") {
          setExceedsBudget(numAmount / usdToUyu > selectedMinistry.budget);
        }
      }
    } else {
      setExceedsBudget(false);
    }
  }, [amount, currency, selectedMinistry]);

  useEffect(() => {
    if (ministry) {
      setLeader("");
    }
  }, [ministry]);

  const handleSubmit = () => {
    if (!date || !concept || !ministry || !leader || !amount) return;

    onSubmit({
      date,
      concept,
      description,
      ministry: selectedMinistry?.name || "",
      leader: leaders.find((l) => l.id === leader)?.name || "",
      currency,
      amount: Number.parseFloat(amount),
    });

    // Reset form
    setDate(new Date());
    setConcept("");
    setDescription("");
    setMinistry("");
    setLeader("");
    setCurrency("UYU");
    setAmount("");
    setOpen(false);
  };

  const isValid = date && concept && ministry && leader && amount && Number.parseFloat(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={true}>
        <BoardButton variant="primary">
          <Plus className={requestFormModalRequestsPage.triggerIcon} />
          Nueva solicitud
        </BoardButton>
      </DialogTrigger>
      <DialogContent className={requestFormModalRequestsPage.content}>
        <DialogHeader>
          <DialogTitle>Crear Solicitud de Fondos</DialogTitle>
          <DialogDescription>
            Envía una nueva solicitud para fondos del ministerio. Las solicitudes deben ser
            aprobadas por el tesorero.
          </DialogDescription>
        </DialogHeader>

        <div className={requestFormModalRequestsPage.fields}>
          <div className={requestFormModalRequestsPage.field}>
            <Label htmlFor="date">Fecha</Label>
            <Popover>
              <PopoverTrigger asChild={true}>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    requestFormModalRequestsPage.dateTrigger,
                    !date && requestFormModalRequestsPage.dateTriggerEmpty,
                  )}
                >
                  <CalendarIcon className={requestFormModalRequestsPage.dateIcon} />
                  {date ? format(date, "PPP") : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className={requestFormModalRequestsPage.popover} align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  autoFocus={true}
                />
              </PopoverContent>
            </Popover>
            <p className={requestFormModalRequestsPage.hint}>
              Solicitudes presentadas antes del viernes serán procesadas a la semana siguiente.
            </p>
          </div>

          <div className={requestFormModalRequestsPage.field}>
            <Label htmlFor="concept">Concepto</Label>
            <Input
              id="concept"
              placeholder="p. ej., Suministros de evento, Alquiler de equipo"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
            />
          </div>

          <div className={requestFormModalRequestsPage.field}>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Proporciona detalles adicionales sobre esta solicitud..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className={requestFormModalRequestsPage.pair}>
            <div className={requestFormModalRequestsPage.field}>
              <Label htmlFor="ministry">Ministerio</Label>
              <Select value={ministry} onValueChange={setMinistry}>
                <SelectTrigger id="ministry">
                  <SelectValue placeholder="Selecciona ministerio" />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={requestFormModalRequestsPage.field}>
              <Label htmlFor="leader">Líder</Label>
              <Select value={leader} onValueChange={setLeader} disabled={!ministry}>
                <SelectTrigger id="leader">
                  <SelectValue
                    placeholder={ministry ? "Selecciona líder" : "Selecciona ministerio primero"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {ministryLeaders.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={requestFormModalRequestsPage.triple}>
            <div className={requestFormModalRequestsPage.field}>
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UYU">UYU</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={requestFormModalRequestsPage.wideField}>
              <Label htmlFor="amount">Cantidad</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {exceedsBudget && (
            <Alert variant="destructive" className={requestFormModalRequestsPage.alert}>
              <AlertTriangle className={requestFormModalRequestsPage.alertIcon} />
              <AlertDescription>
                This amount exceeds the ministry&apos;s budget of{" "}
                {new Intl.NumberFormat("es-UY", {
                  style: "currency",
                  currency: selectedMinistry?.budgetCurrency,
                  minimumFractionDigits: 0,
                }).format(selectedMinistry?.budget || 0)}
                . It may require additional approval.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
