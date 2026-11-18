"use client";

import { KeyRound, MoreHorizontal, Pencil, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { CreateUserModal } from "@/app/(dashboard)/settings/components/create-user-modal";
import type {
  SettingsSelectOption,
  SettingsUser,
  SettingsUserFormField,
  SettingsUserFormValues,
} from "@/app/(dashboard)/settings/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SettingsSectionShell } from "./settings-section-shell";

interface UsersSettingsPanelProps {
  users: SettingsUser[];
  ministryOptions: SettingsSelectOption[];
  roleOptions: SettingsSelectOption[];
}

function getStatusBadgeClass(status: SettingsUser["status"]) {
  if (status === "Activo") {
    return "bg-success-surface text-income";
  }

  if (status === "Pendiente") {
    return "bg-warning-surface text-warning";
  }

  return "bg-accent text-accent-foreground dark:text-expense";
}

function getUserTypeBadgeClass(userType: SettingsUser["userType"]) {
  if (userType === "Líder") {
    return "bg-secondary text-secondary-foreground";
  }

  if (userType === "Colaborador") {
    return "bg-secondary text-secondary-foreground";
  }

  return "bg-secondary text-secondary-foreground";
}

function createDefaultUserFormValues(): SettingsUserFormValues {
  return {
    fullName: "",
    userType: "",
    ministry: "",
    email: "",
    role: "",
  };
}

function getRequiredFields(values: SettingsUserFormValues): SettingsUserFormField[] {
  return (Object.entries(values) as Array<[SettingsUserFormField, string]>).reduce<
    SettingsUserFormField[]
  >((missingFields, [field, value]) => {
    if (!value.trim()) {
      missingFields.push(field);
    }

    return missingFields;
  }, []);
}

function mapFormValuesToUser(values: SettingsUserFormValues): SettingsUser {
  return {
    id: `user-${Date.now()}`,
    name: values.fullName,
    email: values.email,
    userType: values.userType || "Miembro",
    ministry: values.ministry,
    role: values.role,
    status: "Pendiente",
    lastAccess: "Sin activación",
  };
}

interface UserRowActionsProps {
  user: SettingsUser;
}

function UserRowActions({ user }: UserRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Acciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Pencil className="size-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem>
          <KeyRound className="size-4" />
          Restablecer contraseña
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 className="size-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UsersSettingsPanel({
  users,
  ministryOptions,
  roleOptions,
}: UsersSettingsPanelProps) {
  const [managedUsers, setManagedUsers] = useState(users);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<SettingsUserFormValues>(
    createDefaultUserFormValues(),
  );
  const [requiredFields, setRequiredFields] = useState<SettingsUserFormField[]>([]);

  const closeCreateUserModal = () => {
    setIsCreateUserModalOpen(false);
    setFormValues(createDefaultUserFormValues());
    setRequiredFields([]);
  };

  const handleCreateUser = () => {
    setFormValues(createDefaultUserFormValues());
    setRequiredFields([]);
    setIsCreateUserModalOpen(true);
  };

  const handleFieldChange = (
    field: SettingsUserFormField,
    value: SettingsUserFormValues[SettingsUserFormField],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    const nextRequiredFields = getRequiredFields(formValues);

    if (nextRequiredFields.length > 0) {
      setRequiredFields(nextRequiredFields);
      return;
    }

    setManagedUsers((currentUsers) => [mapFormValuesToUser(formValues), ...currentUsers]);
    closeCreateUserModal();
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_340px]">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight">Usuarios</h2>
              <p className="text-sm text-muted-foreground">
                Controla accesos, roles asignados y trazabilidad operativa del equipo financiero.
              </p>
            </div>
            <Button type="button" size="sm" onClick={handleCreateUser}>
              <UserPlus className="size-4" />
              Nuevo usuario
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ministerio</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {managedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="whitespace-normal">
                      <div className="space-y-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-muted-foreground text-sm">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getUserTypeBadgeClass(user.userType)}>
                        {user.userType}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal">{user.ministry}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{user.lastAccess}</TableCell>
                    <TableCell>
                      <UserRowActions user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-6">
          <SettingsSectionShell
            title="Políticas de acceso"
            description="Parámetros visibles para futuras validaciones globales del sistema."
            contentClassName="space-y-4"
          >
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <ShieldCheck className="size-4 text-primary" />
                Doble validación administrativa
              </div>
              <p className="text-muted-foreground text-sm">
                Requerida para altas de usuarios con permisos de aprobación o cierre financiero.
              </p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <KeyRound className="size-4 text-primary" />
                Revisión de credenciales
              </div>
              <p className="text-muted-foreground text-sm">
                Las cuentas pendientes deben completar activación antes de operar en tesorería.
              </p>
            </div>
          </SettingsSectionShell>
        </div>
      </div>

      <CreateUserModal
        open={isCreateUserModalOpen}
        values={formValues}
        ministryOptions={ministryOptions}
        roleOptions={roleOptions}
        requiredFields={requiredFields}
        onOpenChange={(open) => {
          if (!open) {
            closeCreateUserModal();
            return;
          }

          setIsCreateUserModalOpen(true);
        }}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={closeCreateUserModal}
      />
    </>
  );
}
