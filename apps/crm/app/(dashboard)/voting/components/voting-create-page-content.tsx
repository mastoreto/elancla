"use client";

import { ChevronLeft, GripVertical, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { MajorityType, VotingType } from "../types";
import { useVotingCollection } from "../use-voting-data";
import {
  getDefaultOptionsForType,
  majorityTypeLabels,
  votingStatusLabels,
  votingTypeLabels,
} from "../voting-config";
import { getVotingListPath, getVotingModeratorPath } from "../voting-routes";
import { VotingStatusBadge } from "./voting-status-badge";

const votingCreatePageContentVotingPage = {
  hint: cn("flex items-center gap-2 text-sm text-muted-foreground"),
  page: cn("grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]"),
  formCard: cn("border-border/70 bg-card shadow-sm"),
  previewCard: cn("border-border/70 bg-card/80 shadow-sm"),
  section: cn("space-y-6"),
  fieldGroup: cn("space-y-5"),
  optionRow: cn("flex items-center gap-2 rounded-xl border border-border/70 bg-muted/20 p-3"),
  optionInput: cn("h-11 bg-background"),
  helper: cn("text-sm text-muted-foreground"),
  previewMeta: cn("grid gap-4 text-sm text-muted-foreground"),
  previewLabel: cn("text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"),
  optionPill: cn("rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"),
  previewOptions: cn("flex flex-wrap gap-2"),
  footer: cn("flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between"),
};

const minimumOptionsByType: Record<VotingType, number> = {
  motion: 2,
  binary: 2,
  list: 2,
};

interface VotingOptionDraft {
  id: string;
  value: string;
}

function createOptionDraft(value: string): VotingOptionDraft {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    value,
  };
}

export function VotingCreatePageContent() {
  const router = useRouter();
  const { createVoting } = useVotingCollection();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<VotingType>("motion");
  const [quorum, setQuorum] = useState("80");
  const [majorityType, setMajorityType] = useState<MajorityType>("simple");
  const [options, setOptions] = useState(() =>
    getDefaultOptionsForType("motion").map((option) => createOptionDraft(option)),
  );
  const [isPending, startTransition] = useTransition();

  const trimmedOptions = useMemo(
    () => options.map((option) => option.value.trim()).filter(Boolean),
    [options],
  );
  const canSubmit = title.trim().length >= 5 && trimmedOptions.length >= minimumOptionsByType[type];

  const handleTypeChange = (value: VotingType) => {
    setType(value);
    setOptions(getDefaultOptionsForType(value).map((option) => createOptionDraft(option)));
  };

  const handleOptionChange = (optionId: string, value: string) => {
    setOptions((current) =>
      current.map((option) => (option.id === optionId ? { ...option, value } : option)),
    );
  };

  const handleAddOption = () => {
    setOptions((current) => [...current, createOptionDraft(`Opción ${current.length + 1}`)]);
  };

  const handleRemoveOption = (optionId: string) => {
    setOptions((current) => {
      if (current.length <= minimumOptionsByType[type]) {
        return current;
      }

      return current.filter((option) => option.id !== optionId);
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    startTransition(() => {
      const votingId = createVoting({
        title,
        type,
        quorum: Number(quorum) || 1,
        majorityType,
        options: trimmedOptions,
      });

      router.push(getVotingModeratorPath(votingId));
    });
  };

  return (
    <div className={votingCreatePageContentVotingPage.page}>
      <Card className={votingCreatePageContentVotingPage.formCard}>
        <CardHeader>
          <div className={votingCreatePageContentVotingPage.hint}>
            <ChevronLeft className="size-4" />
            <Link href={getVotingListPath()} className="hover:text-foreground transition-colors">
              Volver al listado
            </Link>
          </div>
          <CardTitle className="text-2xl">Crear nueva votación</CardTitle>
          <CardDescription className="max-w-2xl leading-6">
            Define una estructura simple y legible para que el moderador pueda abrirla sin fricción
            y los miembros voten con seguridad en un máximo de dos pasos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className={votingCreatePageContentVotingPage.section}>
            <FieldGroup className={votingCreatePageContentVotingPage.fieldGroup}>
              <Field>
                <FieldLabel htmlFor="voting-title">Título</FieldLabel>
                <Input
                  id="voting-title"
                  className="h-11"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ej. Confirmación del presupuesto de misiones"
                  autoComplete="off"
                />
                <FieldDescription>
                  Usa un texto corto y explícito. Debe poder leerse en voz alta sin ambigüedad.
                </FieldDescription>
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field>
                  <FieldLabel>Tipo</FieldLabel>
                  <Select
                    value={type}
                    onValueChange={(value) => handleTypeChange(value as VotingType)}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(votingTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Mayoría</FieldLabel>
                  <Select
                    value={majorityType}
                    onValueChange={(value) => setMajorityType(value as MajorityType)}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Selecciona la mayoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(majorityTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="voting-quorum">Quorum requerido</FieldLabel>
                <Input
                  id="voting-quorum"
                  type="number"
                  min={1}
                  className="h-11"
                  value={quorum}
                  onChange={(event) => setQuorum(event.target.value)}
                />
                <FieldDescription>
                  Número mínimo de presentes para validar el resultado final.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Opciones</FieldLabel>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.id} className={votingCreatePageContentVotingPage.optionRow}>
                      <GripVertical className="size-4 text-muted-foreground" />
                      <Input
                        className={votingCreatePageContentVotingPage.optionInput}
                        value={option.value}
                        onChange={(event) => handleOptionChange(option.id, event.target.value)}
                        placeholder={`Opción ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(option.id)}
                        disabled={options.length <= minimumOptionsByType[type]}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className={votingCreatePageContentVotingPage.helper}>
                    {trimmedOptions.length} opción{trimmedOptions.length === 1 ? "" : "es"} válidas.
                  </p>
                  <Button type="button" variant="outline" onClick={handleAddOption}>
                    <Plus className="size-4" />
                    Agregar opción
                  </Button>
                </div>
              </Field>
            </FieldGroup>

            <div className={votingCreatePageContentVotingPage.footer}>
              <Button type="button" variant="ghost" asChild={true}>
                <Link href={getVotingListPath()}>Cancelar</Link>
              </Button>

              <Button type="submit" disabled={!canSubmit || isPending}>
                {isPending ? "Creando..." : "Guardar y abrir moderación"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className={votingCreatePageContentVotingPage.previewCard}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <VotingStatusBadge status="draft" />
            <span className={votingCreatePageContentVotingPage.optionPill}>
              {votingStatusLabels.draft}
            </span>
          </div>
          <CardTitle className="text-xl">{title.trim() || "Vista previa de la votación"}</CardTitle>
          <CardDescription className="leading-6">
            Así verá el equipo moderador la configuración inicial antes de abrir la sesión.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className={votingCreatePageContentVotingPage.previewMeta}>
            <div>
              <p className={votingCreatePageContentVotingPage.previewLabel}>Tipo</p>
              <p className="text-foreground">{votingTypeLabels[type]}</p>
            </div>
            <div>
              <p className={votingCreatePageContentVotingPage.previewLabel}>Mayoría</p>
              <p className="text-foreground">{majorityTypeLabels[majorityType]}</p>
            </div>
            <div>
              <p className={votingCreatePageContentVotingPage.previewLabel}>Quorum</p>
              <p className="text-foreground">{Number(quorum) || 1} presentes</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className={votingCreatePageContentVotingPage.previewLabel}>Opciones visibles</p>
            <div className={votingCreatePageContentVotingPage.previewOptions}>
              {trimmedOptions.map((option) => (
                <span key={option} className={votingCreatePageContentVotingPage.optionPill}>
                  {option}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
