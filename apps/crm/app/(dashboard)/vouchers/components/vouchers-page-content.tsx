"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { VoucherDeleteDialog } from "@/app/(dashboard)/vouchers/components/voucher-delete-dialog";
import { VoucherModal } from "@/app/(dashboard)/vouchers/components/voucher-modal";
import { VouchersTable } from "@/app/(dashboard)/vouchers/components/vouchers-table";
import type {
  Voucher,
  VoucherFormField,
  VoucherFormValues,
  VoucherModalMode,
  VoucherRelatedOption,
} from "@/app/(dashboard)/vouchers/types";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/src/componentes/dashboard";

interface VouchersPageContentProps {
  initialVouchers: Voucher[];
  relatedOptions: VoucherRelatedOption[];
  initialErrorMessage?: string | null;
  isLoading?: boolean;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string, fallback: Date) {
  if (!value) {
    return fallback;
  }

  return new Date(`${value}T00:00:00`);
}

function getRelatedEntityLabel(option: VoucherRelatedOption) {
  if (option.kind === "movement") {
    return `Movimiento · ${option.label}`;
  }

  return `Solicitud · ${option.label}`;
}

function getRelatedEntityValue(relatedEntity: string, relatedOptions: VoucherRelatedOption[]) {
  const valueMatch = relatedOptions.find((option) => option.value === relatedEntity);

  if (valueMatch) {
    return valueMatch.value;
  }

  const labelMatch = relatedOptions.find(
    (option) => getRelatedEntityLabel(option) === relatedEntity,
  );

  return labelMatch?.value ?? relatedEntity;
}

function getRelatedEntityDisplay(value: string, relatedOptions: VoucherRelatedOption[]) {
  const option = relatedOptions.find((item) => item.value === value);

  if (!option) {
    return value;
  }

  return getRelatedEntityLabel(option);
}

function createDefaultFormValues(): VoucherFormValues {
  return {
    description: "",
    justification: "",
    amount: "",
    currency: "UYU",
    date: formatDateInput(new Date()),
    responsible: "",
    relatedEntity: "",
  };
}

function mapVoucherToFormValues(
  voucher: Voucher,
  relatedOptions: VoucherRelatedOption[],
): VoucherFormValues {
  return {
    description: voucher.description,
    justification: voucher.justification ?? "",
    amount: String(voucher.amount),
    currency: voucher.currency,
    date: formatDateInput(voucher.date),
    responsible: voucher.responsible,
    relatedEntity: getRelatedEntityValue(voucher.relatedEntity, relatedOptions),
  };
}

function mapFormValuesToVoucher(
  values: VoucherFormValues,
  id: string,
  relatedOptions: VoucherRelatedOption[],
): Voucher {
  const fallbackDate = new Date();

  return {
    id,
    description: values.description,
    justification: values.justification || undefined,
    amount: Number(values.amount) || 0,
    currency: values.currency,
    date: parseDateInput(values.date, fallbackDate),
    responsible: values.responsible,
    relatedEntity: getRelatedEntityDisplay(values.relatedEntity, relatedOptions),
  };
}

export function VouchersPageContent({
  initialVouchers,
  relatedOptions,
  initialErrorMessage = null,
  isLoading = false,
}: VouchersPageContentProps) {
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [modalMode, setModalMode] = useState<VoucherModalMode>("create");
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [deleteVoucherId, setDeleteVoucherId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<VoucherFormValues>(createDefaultFormValues());

  const selectedVoucher = useMemo(
    () => vouchers.find((voucher) => voucher.id === selectedVoucherId) ?? null,
    [selectedVoucherId, vouchers],
  );

  const voucherToDelete = useMemo(
    () => vouchers.find((voucher) => voucher.id === deleteVoucherId) ?? null,
    [deleteVoucherId, vouchers],
  );

  const closeVoucherModal = () => {
    setIsVoucherModalOpen(false);
    setSelectedVoucherId(null);
  };

  const closeDeleteDialog = () => {
    setDeleteVoucherId(null);
  };

  const handleCreate = () => {
    setModalMode("create");
    setSelectedVoucherId(null);
    setFormValues(createDefaultFormValues());
    setIsVoucherModalOpen(true);
  };

  const handleView = (voucher: Voucher) => {
    setModalMode("view");
    setSelectedVoucherId(voucher.id);
    setFormValues(mapVoucherToFormValues(voucher, relatedOptions));
    setIsVoucherModalOpen(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setModalMode("edit");
    setSelectedVoucherId(voucher.id);
    setFormValues(mapVoucherToFormValues(voucher, relatedOptions));
    setIsVoucherModalOpen(true);
  };

  const handleDeleteRequest = (voucher: Voucher) => {
    setDeleteVoucherId(voucher.id);
  };

  const handleFieldChange = (
    field: VoucherFormField,
    value: VoucherFormValues[VoucherFormField],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (modalMode === "edit" && selectedVoucherId) {
      setVouchers((currentVouchers) =>
        currentVouchers.map((voucher) =>
          voucher.id === selectedVoucherId
            ? mapFormValuesToVoucher(formValues, voucher.id, relatedOptions)
            : voucher,
        ),
      );
      closeVoucherModal();
      return;
    }

    const nextVoucher = mapFormValuesToVoucher(formValues, `voucher-${Date.now()}`, relatedOptions);

    setVouchers((currentVouchers) => [nextVoucher, ...currentVouchers]);
    closeVoucherModal();
  };

  const handleConfirmDelete = () => {
    if (!deleteVoucherId) {
      return;
    }

    setVouchers((currentVouchers) =>
      currentVouchers.filter((voucher) => voucher.id !== deleteVoucherId),
    );
    closeDeleteDialog();
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        actions={
          <Button className="rounded-full" onClick={handleCreate} type="button">
            <Plus aria-hidden="true" />
            Nuevo comprobante
          </Button>
        }
        description="Respaldo interno para gastos sin boleta, con justificación y responsable."
        emphasis="sin boleta"
        kicker="Documentos"
        title="Comprobantes"
      />

      <VouchersTable
        vouchers={vouchers}
        isLoading={isLoading}
        errorMessage={initialErrorMessage}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      <VoucherModal
        open={isVoucherModalOpen}
        mode={modalMode}
        voucher={selectedVoucher}
        values={formValues}
        relatedOptions={relatedOptions}
        requiredFields={[]}
        onOpenChange={(open) => {
          if (!open) {
            closeVoucherModal();
            return;
          }

          setIsVoucherModalOpen(true);
        }}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={closeVoucherModal}
      />

      <VoucherDeleteDialog
        open={deleteVoucherId !== null}
        voucherDescription={voucherToDelete?.description}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
