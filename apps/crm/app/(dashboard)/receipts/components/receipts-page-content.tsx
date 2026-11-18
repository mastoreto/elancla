"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ReceiptDeleteDialog } from "@/app/(dashboard)/receipts/components/receipt-delete-dialog";
import { ReceiptModal } from "@/app/(dashboard)/receipts/components/receipt-modal";
import { ReceiptsTable } from "@/app/(dashboard)/receipts/components/receipts-table";
import type {
  Receipt,
  ReceiptFormField,
  ReceiptFormValues,
  ReceiptModalMode,
  ReceiptRelatedOption,
} from "@/app/(dashboard)/receipts/types/index";
import { DashboardPageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";

interface ReceiptsPageContentProps {
  initialReceipts: Receipt[];
  relatedOptions: ReceiptRelatedOption[];
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

function createDefaultFormValues(): ReceiptFormValues {
  return {
    number: "",
    provider: "",
    amount: "",
    currency: "UYU",
    date: formatDateInput(new Date()),
    relatedEntity: "",
    fileUrl: "",
  };
}

function mapReceiptToFormValues(receipt: Receipt): ReceiptFormValues {
  return {
    number: receipt.number,
    provider: receipt.provider,
    amount: String(receipt.amount),
    currency: receipt.currency,
    date: formatDateInput(receipt.date),
    relatedEntity: receipt.relatedEntity,
    fileUrl: receipt.fileUrl ?? "",
  };
}

function mapFormValuesToReceipt(values: ReceiptFormValues, id: string): Receipt {
  const fallbackDate = new Date();

  return {
    id,
    number: values.number,
    provider: values.provider,
    amount: Number(values.amount) || 0,
    currency: values.currency ?? "UYU",
    date: parseDateInput(values.date, fallbackDate),
    relatedEntity: values.relatedEntity,
    fileUrl: values.fileUrl || undefined,
  };
}

export function ReceiptsPageContent({
  initialReceipts,
  relatedOptions,
  initialErrorMessage = null,
  isLoading = false,
}: ReceiptsPageContentProps) {
  const [receipts, setReceipts] = useState(initialReceipts);
  const [modalMode, setModalMode] = useState<ReceiptModalMode>("create");
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [deleteReceiptId, setDeleteReceiptId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ReceiptFormValues>(createDefaultFormValues());
  const [requiredFields, setRequiredFields] = useState<ReceiptFormField[]>([]);

  const selectedReceipt = useMemo(
    () => receipts.find((receipt) => receipt.id === selectedReceiptId) ?? null,
    [receipts, selectedReceiptId],
  );

  const receiptToDelete = useMemo(
    () => receipts.find((receipt) => receipt.id === deleteReceiptId) ?? null,
    [deleteReceiptId, receipts],
  );

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedReceiptId(null);
    setRequiredFields([]);
  };

  const closeDeleteDialog = () => {
    setDeleteReceiptId(null);
  };

  const handleCreate = () => {
    setModalMode("create");
    setSelectedReceiptId(null);
    setFormValues(createDefaultFormValues());
    setRequiredFields([]);
    setIsReceiptModalOpen(true);
  };

  const handleView = (receipt: Receipt) => {
    setModalMode("view");
    setSelectedReceiptId(receipt.id);
    setFormValues(mapReceiptToFormValues(receipt));
    setRequiredFields([]);
    setIsReceiptModalOpen(true);
  };

  const handleEdit = (receipt: Receipt) => {
    setModalMode("edit");
    setSelectedReceiptId(receipt.id);
    setFormValues(mapReceiptToFormValues(receipt));
    setRequiredFields([]);
    setIsReceiptModalOpen(true);
  };

  const handleDeleteRequest = (receipt: Receipt) => {
    setDeleteReceiptId(receipt.id);
  };

  const handleFieldChange = (
    field: ReceiptFormField,
    value: ReceiptFormValues[ReceiptFormField],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (modalMode === "edit" && selectedReceiptId) {
      setReceipts((currentReceipts) =>
        currentReceipts.map((receipt) =>
          receipt.id === selectedReceiptId
            ? mapFormValuesToReceipt(formValues, receipt.id)
            : receipt,
        ),
      );
      closeReceiptModal();
      return;
    }

    const nextReceipt = mapFormValuesToReceipt(formValues, `receipt-${Date.now()}`);
    setReceipts((currentReceipts) => [nextReceipt, ...currentReceipts]);
    closeReceiptModal();
  };

  const handleConfirmDelete = () => {
    if (!deleteReceiptId) {
      return;
    }

    setReceipts((currentReceipts) =>
      currentReceipts.filter((receipt) => receipt.id !== deleteReceiptId),
    );
    closeDeleteDialog();
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        actions={
          <Button className="rounded-full" onClick={handleCreate} type="button">
            <Plus aria-hidden="true" />
            Subir boleta
          </Button>
        }
        description="Facturas y boletas de proveedores, vinculadas al gasto que respaldan."
        emphasis="de proveedores"
        kicker="Documentos"
        title="Boletas"
      />

      <ReceiptsTable
        receipts={receipts}
        isLoading={isLoading}
        errorMessage={initialErrorMessage}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      <ReceiptModal
        open={isReceiptModalOpen}
        mode={modalMode}
        receipt={selectedReceipt}
        values={formValues}
        relatedOptions={relatedOptions}
        requiredFields={requiredFields}
        onOpenChange={(open) => {
          if (!open) {
            closeReceiptModal();
            return;
          }

          setIsReceiptModalOpen(true);
        }}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={closeReceiptModal}
      />

      <ReceiptDeleteDialog
        open={deleteReceiptId !== null}
        receiptNumber={receiptToDelete?.number}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
            return;
          }
        }}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
