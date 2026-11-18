import type {
  SettingsSelectOption,
  SettingsUserFormField,
  SettingsUserFormValues,
  SettingsUserType,
} from "@/app/(dashboard)/settings/types";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface UserFormProps {
  values: SettingsUserFormValues;
  ministryOptions: SettingsSelectOption[];
  roleOptions: SettingsSelectOption[];
  requiredFields?: SettingsUserFormField[];
  onFieldChange: (
    field: SettingsUserFormField,
    value: SettingsUserFormValues[SettingsUserFormField],
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const userTypeOptions: Array<{
  value: SettingsUserType;
  label: string;
}> = [
  { value: "Miembro", label: "Miembro" },
  { value: "Líder", label: "Líder" },
  { value: "Colaborador", label: "Colaborador" },
];

const userFormSettingsPage = {
  fieldGroup: cn("grid gap-4 md:grid-cols-2 [&>[data-slot=field]]:gap-2"),
  block: cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"),
};

export function UserForm({
  values,
  ministryOptions,
  roleOptions,
  requiredFields = [],
  onFieldChange,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const hasError = (field: SettingsUserFormField) => requiredFields.includes(field);

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <FieldGroup className={userFormSettingsPage.fieldGroup}>
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="user-full-name">Nombre y Apellido</FieldLabel>
          <Input
            id="user-full-name"
            placeholder="Ingresa el nombre completo"
            value={values.fullName}
            aria-invalid={hasError("fullName") || undefined}
            onChange={(event) => onFieldChange("fullName", event.target.value)}
          />
          {hasError("fullName") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel>Tipo</FieldLabel>
          <Select
            value={values.userType || undefined}
            onValueChange={(value) => onFieldChange("userType", value as SettingsUserType)}
          >
            <SelectTrigger className="w-full" aria-invalid={hasError("userType") || undefined}>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              {userTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError("userType") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel>Ministerio</FieldLabel>
          <Select
            value={values.ministry || undefined}
            onValueChange={(value) => onFieldChange("ministry", value)}
          >
            <SelectTrigger className="w-full" aria-invalid={hasError("ministry") || undefined}>
              <SelectValue placeholder="Selecciona un ministerio" />
            </SelectTrigger>
            <SelectContent>
              {ministryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError("ministry") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="user-email">Email</FieldLabel>
          <Input
            id="user-email"
            type="email"
            placeholder="usuario@parroquia.uy"
            value={values.email}
            aria-invalid={hasError("email") || undefined}
            onChange={(event) => onFieldChange("email", event.target.value)}
          />
          {hasError("email") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel>Rol</FieldLabel>
          <Select
            value={values.role || undefined}
            onValueChange={(value) => onFieldChange("role", value)}
          >
            <SelectTrigger className="w-full" aria-invalid={hasError("role") || undefined}>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError("role") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>
      </FieldGroup>

      <div className={userFormSettingsPage.block}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear usuario</Button>
      </div>
    </form>
  );
}
