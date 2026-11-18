import type {
  SettingsSelectOption,
  SettingsUserFormField,
  SettingsUserFormValues,
} from "@/app/(dashboard)/settings/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "./user-form";

interface CreateUserModalProps {
  open: boolean;
  values: SettingsUserFormValues;
  ministryOptions: SettingsSelectOption[];
  roleOptions: SettingsSelectOption[];
  requiredFields?: SettingsUserFormField[];
  onOpenChange: (open: boolean) => void;
  onFieldChange: (
    field: SettingsUserFormField,
    value: SettingsUserFormValues[SettingsUserFormField],
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CreateUserModal({
  open,
  values,
  ministryOptions,
  roleOptions,
  requiredFields,
  onOpenChange,
  onFieldChange,
  onSubmit,
  onCancel,
}: CreateUserModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
          <DialogDescription>
            Define la información básica, el ministerio de referencia y el rol del nuevo usuario.
          </DialogDescription>
        </DialogHeader>

        <UserForm
          values={values}
          ministryOptions={ministryOptions}
          roleOptions={roleOptions}
          requiredFields={requiredFields}
          onFieldChange={onFieldChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
