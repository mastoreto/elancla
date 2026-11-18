"use client";

import { ImagePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { DashboardPageHeader } from "@/src/componentes/dashboard";
import { type MinistryFormErrors, ministryFormSchema } from "../schema";
import type { MinistryCategory, MinistryFormValues } from "../types";

const CATEGORIES: MinistryCategory[] = ["Por edades", "Cultos y Palabra", "Servicio"];

export const EMPTY_MINISTRY_FORM: MinistryFormValues = {
  name: "",
  description: "",
  category: "",
  ages: "",
  howToJoin: "",
  leaderName: "",
  coLeaderName: "",
  schedule: "",
  location: "",
  budget: "",
  currency: "$U",
  visibleOnSite: true,
};

interface MinistryFormProps {
  mode: "create" | "edit";
  initialValues?: MinistryFormValues;
}

const ministryFormMinistriesPage = {
  form: cn("space-y-6"),
  card: cn("space-y-5 rounded-xl border border-border bg-card p-6 shadow-card"),
  cardTitle: cn("font-display text-lg font-medium"),
  pair: cn("grid gap-5 md:grid-cols-2"),
  cover: cn("flex items-center justify-between gap-4 rounded-lg border border-dashed p-4"),
  hint: cn("text-sm text-muted-foreground"),
  visibility: cn("flex items-center justify-between gap-4 rounded-lg bg-bruma p-4"),
  actions: cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"),
};

export function MinistryForm({ mode, initialValues = EMPTY_MINISTRY_FORM }: MinistryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<MinistryFormValues>(initialValues);
  const [errors, setErrors] = useState<MinistryFormErrors>({});
  const isEdit = mode === "edit";

  const update = <K extends keyof MinistryFormValues>(field: K, value: MinistryFormValues[K]) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  // Seed-data screen: validating and going back to the list stands in for the real save.
  const submit = () => {
    const result = ministryFormSchema.safeParse(values);
    if (!result.success) {
      const next: MinistryFormErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof MinistryFormErrors] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    router.push(getChurchRoutePath("ministries"));
  };

  return (
    <form
      className={ministryFormMinistriesPage.form}
      noValidate={true}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <DashboardPageHeader
        description="Contenido para el sitio web, liderazgo y presupuesto."
        emphasis="ministerio"
        kicker="Contenido · Ministerios"
        title={isEdit ? "Editar" : "Nuevo"}
      />

      <section className={ministryFormMinistriesPage.card}>
        <h2 className={ministryFormMinistriesPage.cardTitle}>Contenido del sitio</h2>
        <Field>
          <FieldLabel htmlFor="ministry-name">Nombre del ministerio *</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.name)}
            id="ministry-name"
            onChange={(event) => update("name", event.target.value)}
            placeholder="Ej. Ministerio de Niños"
            value={values.name}
          />
          {errors.name ? <FieldError>{errors.name}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="ministry-description">Descripción *</FieldLabel>
          <Textarea
            aria-invalid={Boolean(errors.description)}
            id="ministry-description"
            onChange={(event) => update("description", event.target.value)}
            placeholder="Qué hace este ministerio y a quién sirve"
            rows={3}
            value={values.description}
          />
          <p className={ministryFormMinistriesPage.hint}>
            Se muestra en la lista y en el sitio web.
          </p>
          {errors.description ? <FieldError>{errors.description}</FieldError> : null}
        </Field>
        <div className={ministryFormMinistriesPage.pair}>
          <Field>
            <FieldLabel>Categoría en el sitio *</FieldLabel>
            <Select
              onValueChange={(value) => update("category", value as MinistryCategory)}
              value={values.category}
            >
              <SelectTrigger aria-invalid={Boolean(errors.category)} aria-label="Categoría">
                <SelectValue placeholder="Elegir grupo" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category ? <FieldError>{errors.category}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="ministry-ages">Edades o a quién sirve</FieldLabel>
            <Input
              id="ministry-ages"
              onChange={(event) => update("ages", event.target.value)}
              placeholder="Opcional"
              value={values.ages}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="ministry-join">Cómo sumarse</FieldLabel>
          <Textarea
            id="ministry-join"
            onChange={(event) => update("howToJoin", event.target.value)}
            placeholder="Qué debe hacer alguien para unirse"
            rows={2}
            value={values.howToJoin}
          />
        </Field>
        <div className={ministryFormMinistriesPage.cover}>
          <p className={ministryFormMinistriesPage.hint}>
            Se muestra en la tarjeta del sitio web. JPG o PNG, horizontal.
          </p>
          <Button type="button" variant="outline">
            <ImagePlus aria-hidden="true" />
            Subir foto
          </Button>
        </div>
      </section>

      <section className={ministryFormMinistriesPage.card}>
        <h2 className={ministryFormMinistriesPage.cardTitle}>Liderazgo y reuniones</h2>
        <div className={ministryFormMinistriesPage.pair}>
          <Field>
            <FieldLabel htmlFor="ministry-leader">Líder *</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.leaderName)}
              id="ministry-leader"
              onChange={(event) => update("leaderName", event.target.value)}
              placeholder="Elegir persona"
              value={values.leaderName}
            />
            {errors.leaderName ? <FieldError>{errors.leaderName}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="ministry-coleader">Co-líder</FieldLabel>
            <Input
              id="ministry-coleader"
              onChange={(event) => update("coLeaderName", event.target.value)}
              placeholder="Opcional"
              value={values.coLeaderName}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ministry-schedule">Reuniones</FieldLabel>
            <Input
              id="ministry-schedule"
              onChange={(event) => update("schedule", event.target.value)}
              placeholder="Día y hora"
              value={values.schedule}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ministry-location">Lugar</FieldLabel>
            <Input
              id="ministry-location"
              onChange={(event) => update("location", event.target.value)}
              placeholder="Dónde se reúnen"
              value={values.location}
            />
          </Field>
        </div>
      </section>

      <section className={ministryFormMinistriesPage.card}>
        <h2 className={ministryFormMinistriesPage.cardTitle}>Presupuesto y publicación</h2>
        <div className={ministryFormMinistriesPage.pair}>
          <Field>
            <FieldLabel htmlFor="ministry-budget">Presupuesto anual</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.budget)}
              id="ministry-budget"
              inputMode="decimal"
              min={0}
              onChange={(event) => update("budget", event.target.value)}
              placeholder="0"
              type="number"
              value={values.budget}
            />
            {errors.budget ? <FieldError>{errors.budget}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel>Moneda</FieldLabel>
            <Select
              onValueChange={(value) => update("currency", value as MinistryFormValues["currency"])}
              value={values.currency}
            >
              <SelectTrigger aria-label="Moneda">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$U">UYU · $U</SelectItem>
                <SelectItem value="$">USD · $</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className={ministryFormMinistriesPage.visibility}>
          <div>
            <FieldLabel htmlFor="ministry-visible">Mostrar en el sitio web</FieldLabel>
            <p className={ministryFormMinistriesPage.hint}>
              Aparece en la página pública de ministerios.
            </p>
          </div>
          <Switch
            checked={values.visibleOnSite}
            id="ministry-visible"
            onCheckedChange={(checked) => update("visibleOnSite", checked)}
          />
        </div>
      </section>

      <div className={ministryFormMinistriesPage.actions}>
        <Button asChild={true} type="button" variant="ghost">
          <Link href={getChurchRoutePath("ministries")}>Cancelar</Link>
        </Button>
        <Button type="submit">{isEdit ? "Guardar cambios" : "Crear ministerio"}</Button>
      </div>
    </form>
  );
}
