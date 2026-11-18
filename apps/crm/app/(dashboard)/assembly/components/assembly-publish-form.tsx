"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import {
  ASSEMBLY_REPORT_SECTIONS,
  type AssemblyPublishErrors,
  assemblyPublishSchema,
} from "../schema";
import type { AssemblyPublishFormValues } from "../types";

const INITIAL_VALUES: AssemblyPublishFormValues = {
  title: "",
  assembly: "",
  validFrom: "",
  validTo: "",
  place: "Templo El Ancla",
  sections: [...ASSEMBLY_REPORT_SECTIONS],
  enableNow: false,
};

const assemblyPublishFormAssemblyPage = {
  form: cn("space-y-6"),
  card: cn("space-y-5 rounded-xl border border-border bg-card p-6 shadow-card"),
  cardTitle: cn("font-display text-lg font-medium"),
  pair: cn("grid gap-5 md:grid-cols-2"),
  sections: cn("grid gap-3 sm:grid-cols-2"),
  section: cn("flex items-center gap-3 text-sm"),
  toggle: cn("flex items-center justify-between gap-4 rounded-lg bg-bruma p-4"),
  hint: cn("text-sm text-muted-foreground"),
  actions: cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"),
};

export function AssemblyPublishForm() {
  const router = useRouter();
  const [values, setValues] = useState<AssemblyPublishFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<AssemblyPublishErrors>({});

  const update = <K extends keyof AssemblyPublishFormValues>(
    field: K,
    value: AssemblyPublishFormValues[K],
  ) => setValues((previous) => ({ ...previous, [field]: value }));

  const toggleSection = (section: string, checked: boolean) =>
    update(
      "sections",
      checked ? [...values.sections, section] : values.sections.filter((item) => item !== section),
    );

  // Seed-data screen: validating and returning to the list stands in for publishing.
  const submit = () => {
    const result = assemblyPublishSchema.safeParse(values);
    if (!result.success) {
      const next: AssemblyPublishErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof AssemblyPublishErrors] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    router.push(getChurchRoutePath("assembly"));
  };

  return (
    <form
      className={assemblyPublishFormAssemblyPage.form}
      noValidate={true}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <DashboardPageHeader
        description="Los asistentes acceden con un código, solo durante la sesión y en el lugar."
        emphasis="informe"
        kicker="Gobierno · Asamblea"
        title="Publicar"
      />

      <section className={assemblyPublishFormAssemblyPage.card}>
        <h2 className={assemblyPublishFormAssemblyPage.cardTitle}>Informe</h2>
        <div className={assemblyPublishFormAssemblyPage.pair}>
          <Field>
            <FieldLabel htmlFor="assembly-title">Título *</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.title)}
              id="assembly-title"
              onChange={(event) => update("title", event.target.value)}
              placeholder="Ej. Informe financiero 2026"
              value={values.title}
            />
            {errors.title ? <FieldError>{errors.title}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="assembly-name">Asamblea *</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.assembly)}
              id="assembly-name"
              onChange={(event) => update("assembly", event.target.value)}
              placeholder="Ej. Asamblea ordinaria · 24 nov"
              value={values.assembly}
            />
            {errors.assembly ? <FieldError>{errors.assembly}</FieldError> : null}
          </Field>
        </div>
        <Field>
          <FieldLabel>Secciones visibles *</FieldLabel>
          <div className={assemblyPublishFormAssemblyPage.sections}>
            {ASSEMBLY_REPORT_SECTIONS.map((section) => (
              <div className={assemblyPublishFormAssemblyPage.section} key={section}>
                <Checkbox
                  id={`assembly-section-${section}`}
                  checked={values.sections.includes(section)}
                  onCheckedChange={(checked) => toggleSection(section, checked === true)}
                />
                <FieldLabel htmlFor={`assembly-section-${section}`}>{section}</FieldLabel>
              </div>
            ))}
          </div>
          {errors.sections ? <FieldError>{errors.sections}</FieldError> : null}
        </Field>
      </section>

      <section className={assemblyPublishFormAssemblyPage.card}>
        <h2 className={assemblyPublishFormAssemblyPage.cardTitle}>Vigencia y lugar</h2>
        <div className={assemblyPublishFormAssemblyPage.pair}>
          <Field>
            <FieldLabel htmlFor="assembly-from">Se habilita *</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.validFrom)}
              id="assembly-from"
              onChange={(event) => update("validFrom", event.target.value)}
              type="datetime-local"
              value={values.validFrom}
            />
            {errors.validFrom ? <FieldError>{errors.validFrom}</FieldError> : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="assembly-to">Vence *</FieldLabel>
            <Input
              aria-invalid={Boolean(errors.validTo)}
              id="assembly-to"
              onChange={(event) => update("validTo", event.target.value)}
              type="datetime-local"
              value={values.validTo}
            />
            {errors.validTo ? <FieldError>{errors.validTo}</FieldError> : null}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="assembly-place">Lugar de la sesión *</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.place)}
            id="assembly-place"
            onChange={(event) => update("place", event.target.value)}
            value={values.place}
          />
          <p className={assemblyPublishFormAssemblyPage.hint}>
            El informe solo se abre para quien esté en este lugar.
          </p>
          {errors.place ? <FieldError>{errors.place}</FieldError> : null}
        </Field>
        <div className={assemblyPublishFormAssemblyPage.toggle}>
          <div>
            <FieldLabel htmlFor="assembly-enable">Habilitar ahora</FieldLabel>
            <p className={assemblyPublishFormAssemblyPage.hint}>
              Si no, queda sin habilitar hasta que lo abras desde el panel.
            </p>
          </div>
          <Switch
            checked={values.enableNow}
            id="assembly-enable"
            onCheckedChange={(checked) => update("enableNow", checked)}
          />
        </div>
      </section>

      <div className={assemblyPublishFormAssemblyPage.actions}>
        <Button asChild={true} type="button" variant="ghost">
          <Link href={getChurchRoutePath("assembly")}>Cancelar</Link>
        </Button>
        <Button type="submit">Publicar informe</Button>
      </div>
    </form>
  );
}
