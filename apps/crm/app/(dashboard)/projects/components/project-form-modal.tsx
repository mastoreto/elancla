"use client";

import { format } from "date-fns";
import { CalendarIcon, Plus, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { Badge } from "@/components/ui/badge";
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
import { ministries } from "@/lib/data";
import type { Currency, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const projectFormModalProjectsPage = {
  content: cn("sm:max-w-[600px] max-h-[90vh] overflow-y-auto"),
  ministryPicker: cn("flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30"),
  dropzone: cn("border-2 border-dashed rounded-lg p-6 text-center bg-muted/20"),
};

interface ProjectFormModalProps {
  project?: Project;
  trigger?: React.ReactNode;
  onSave?: (data: Partial<Project>, reason?: string) => void;
}

export function ProjectFormModal({ project, trigger, onSave }: ProjectFormModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState<Currency>("UYU");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [changeReason, setChangeReason] = useState("");

  const isEditing = !!project;

  useEffect(() => {
    if (project) {
      setTitle(project.name);
      setDescription(project.description || "");
      setSelectedMinistries(project.ministries);
      setBudget(project.budget.toString());
      setCurrency(project.currency);
      setStartDate(new Date(project.startDate));
      setEndDate(project.endDate ? new Date(project.endDate) : undefined);
    }
  }, [project]);

  const resetForm = () => {
    if (!project) {
      setTitle("");
      setDescription("");
      setSelectedMinistries([]);
      setBudget("");
      setCurrency("UYU");
      setStartDate(undefined);
      setEndDate(undefined);
    }
    setChangeReason("");
  };

  const handleMinistryToggle = (ministryName: string) => {
    setSelectedMinistries((prev) =>
      prev.includes(ministryName)
        ? prev.filter((m) => m !== ministryName)
        : [...prev, ministryName],
    );
  };

  const handleSubmit = () => {
    const data: Partial<Project> = {
      name: title,
      description,
      ministries: selectedMinistries,
      budget: Number.parseFloat(budget) || 0,
      currency,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    };

    onSave?.(data, isEditing ? changeReason : undefined);
    setOpen(false);
    resetForm();
  };

  const isValid =
    title && selectedMinistries.length > 0 && budget && startDate && (!isEditing || changeReason);

  const allMinistries = ["General", ...ministries.map((m) => m.name)];

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetForm();
      }}
    >
      <DialogTrigger asChild={true}>
        {trigger || (
          <BoardButton variant="primary">
            <Plus aria-hidden="true" className="size-4" />
            Nuevo proyecto
          </BoardButton>
        )}
      </DialogTrigger>
      <DialogContent className={projectFormModalProjectsPage.content}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Proyecto" : "Crear Nuevo Proyecto"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los detalles del proyecto. Los cambios serán registrados en el historial."
              : "Configura un nuevo proyecto para registrar finanzas y movimientos relacionados."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Proyecto *</Label>
            <Input
              id="title"
              placeholder="Ingresa el título del proyecto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el propósito y objetivos del proyecto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Ministerios *</Label>
            <div className={projectFormModalProjectsPage.ministryPicker}>
              {allMinistries.map((ministry) => (
                <Badge
                  key={ministry}
                  variant={selectedMinistries.includes(ministry) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedMinistries.includes(ministry)
                      ? "bg-accent text-accent-foreground hover:bg-accent/80"
                      : "hover:bg-muted",
                  )}
                  onClick={() => handleMinistryToggle(ministry)}
                >
                  {ministry}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Haz clic para seleccionar/deseleccionar ministerios
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto *</Label>
              <Input
                id="budget"
                type="number"
                placeholder="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Moneda *</Label>
              <div className="flex rounded-lg border bg-muted/30 p-1">
                <button
                  type="button"
                  className={cn(
                    "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                    currency === "UYU"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setCurrency("UYU")}
                >
                  UYU
                </button>
                <button
                  type="button"
                  className={cn(
                    "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                    currency === "USD"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setCurrency("USD")}
                >
                  USD
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Inicio *</Label>
              <Popover>
                <PopoverTrigger asChild={true}>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {startDate ? format(startDate, "PPP") : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    autoFocus={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Fecha de Fin</Label>
              <Popover>
                <PopoverTrigger asChild={true}>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => (startDate ? date < startDate : false)}
                    autoFocus={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="size-4" />
              Documents (Optional)
            </Label>
            <div className={projectFormModalProjectsPage.dropzone}>
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, images, or links supported</p>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Change *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this change is being made..."
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                This will be recorded in the project history
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
