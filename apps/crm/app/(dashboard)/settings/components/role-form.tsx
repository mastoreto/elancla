"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { DashboardPageHeader } from "@/src/componentes/dashboard";
import { SETTINGS_PERMISSION_GROUPS } from "../data/roles";
import { type RoleFormErrors, roleFormSchema } from "../schema";
import type { SettingsRoleFormValues } from "../types";

export const EMPTY_ROLE_FORM: SettingsRoleFormValues = {
  name: "",
  description: "",
  scope: "",
  permissions: [],
};

interface RoleFormProps {
  mode: "create" | "edit";
  initialValues?: SettingsRoleFormValues;
}

const roleFormSettingsPage = {
  form: cn("space-y-6"),
  card: cn("space-y-5 rounded-xl border border-border bg-card p-6 shadow-card"),
  cardTitle: cn("font-display text-lg font-medium"),
  groups: cn("grid gap-6 md:grid-cols-2"),
  groupTitle: cn("mb-3 text-sm font-semibold"),
  permission: cn("flex items-center gap-3 py-1 text-sm"),
  actions: cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"),
};

export function RoleForm({ mode, initialValues = EMPTY_ROLE_FORM }: RoleFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<SettingsRoleFormValues>(initialValues);
  const [errors, setErrors] = useState<RoleFormErrors>({});
  const isEdit = mode === "edit";

  const update = <K extends keyof SettingsRoleFormValues>(
    field: K,
    value: SettingsRoleFormValues[K],
  ) => setValues((previous) => ({ ...previous, [field]: value }));

  const togglePermission = (permission: string, checked: boolean) =>
    update(
      "permissions",
      checked
        ? [...values.permissions, permission]
        : values.permissions.filter((item) => item !== permission),
    );

  // Seed-data screen: validating and returning to settings stands in for the real save.
  const submit = () => {
    const result = roleFormSchema.safeParse(values);
    if (!result.success) {
      const next: RoleFormErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof RoleFormErrors] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    router.push(getChurchRoutePath("settings"));
  };

  return (
    <form
      className={roleFormSettingsPage.form}
      noValidate={true}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <DashboardPageHeader
        description="Define qué puede ver y hacer quien tenga este rol."
        emphasis="rol"
        kicker="Sistema · Configuración"
        title={isEdit ? "Editar" : "Nuevo"}
      />

      <section className={roleFormSettingsPage.card}>
        <h2 className={roleFormSettingsPage.cardTitle}>Datos del rol</h2>
        <Field>
          <FieldLabel htmlFor="role-name">Nombre *</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.name)}
            id="role-name"
            onChange={(event) => update("name", event.target.value)}
            value={values.name}
          />
          {errors.name ? <FieldError>{errors.name}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="role-description">Descripción *</FieldLabel>
          <Textarea
            aria-invalid={Boolean(errors.description)}
            id="role-description"
            onChange={(event) => update("description", event.target.value)}
            rows={2}
            value={values.description}
          />
          {errors.description ? <FieldError>{errors.description}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="role-scope">Alcance *</FieldLabel>
          <Input
            aria-invalid={Boolean(errors.scope)}
            id="role-scope"
            onChange={(event) => update("scope", event.target.value)}
            value={values.scope}
          />
          {errors.scope ? <FieldError>{errors.scope}</FieldError> : null}
        </Field>
      </section>

      <section className={roleFormSettingsPage.card}>
        <h2 className={roleFormSettingsPage.cardTitle}>Permisos</h2>
        <div className={roleFormSettingsPage.groups}>
          {SETTINGS_PERMISSION_GROUPS.map((group) => (
            <div key={group.group}>
              <p className={roleFormSettingsPage.groupTitle}>{group.group}</p>
              {group.permissions.map((permission) => (
                <div className={roleFormSettingsPage.permission} key={permission}>
                  <Checkbox
                    checked={values.permissions.includes(permission)}
                    id={`permission-${permission}`}
                    onCheckedChange={(checked) => togglePermission(permission, checked === true)}
                  />
                  <FieldLabel htmlFor={`permission-${permission}`}>{permission}</FieldLabel>
                </div>
              ))}
            </div>
          ))}
        </div>
        {errors.permissions ? <FieldError>{errors.permissions}</FieldError> : null}
      </section>

      <div className={roleFormSettingsPage.actions}>
        <Button asChild={true} type="button" variant="ghost">
          <Link href={getChurchRoutePath("settings")}>Cancelar</Link>
        </Button>
        <Button type="submit">{isEdit ? "Guardar cambios" : "Crear rol"}</Button>
      </div>
    </form>
  );
}
