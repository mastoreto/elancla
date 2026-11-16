import { ReceiptDetailsPanel } from "@/app/(dashboard)/receipts/components/receipt-details-panel";
import { ReceiptFilePreview } from "@/app/(dashboard)/receipts/components/receipt-file-preview";
import { ReceiptForm } from "@/app/(dashboard)/receipts/components/receipt-form";
import type {
  Receipt,
  ReceiptFormField,
  ReceiptFormValues,
  ReceiptModalMode,
  ReceiptRelatedOption,
} from "@/app/(dashboard)/receipts/types/index";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReceiptModalProps {
  open: boolean;
  mode: ReceiptModalMode;
  receipt: Receipt | null;
  values: ReceiptFormValues;
  relatedOptions: ReceiptRelatedOption[];
  requiredFields?: ReceiptFormField[];
  onOpenChange: (open: boolean) => void;
  onFieldChange: (field: ReceiptFormField, value: ReceiptFormValues[ReceiptFormField]) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function getDialogCopy(mode: ReceiptModalMode) {
  if (mode === "create") {
    return {
      title: "Crear boleta",
      description:
        "Registra una nueva boleta y deja preparado su vínculo con movimientos, solicitudes y auditoría.",
    };
  }

  if (mode === "edit") {
    return {
      title: "Editar boleta",
      description: "Actualiza los datos visibles y revisa el archivo asociado antes de guardar.",
    };
  }

  return {
    title: "Ver boleta",
    description: "Consulta la información visible de la boleta y su archivo adjunto.",
  };
}

export function ReceiptModal({
  open,
  mode,
  receipt,
  values,
  relatedOptions,
  requiredFields,
  onOpenChange,
  onFieldChange,
  onSubmit,
  onCancel,
}: ReceiptModalProps) {
  const dialogCopy = getDialogCopy(mode);
  const previewFileUrl = mode === "view" ? receipt?.fileUrl : values.fileUrl;
  const previewNumber = mode === "view" ? receipt?.number : values.number;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{dialogCopy.title}</DialogTitle>
          <DialogDescription>{dialogCopy.description}</DialogDescription>
        </DialogHeader>

        {mode === "view" && receipt ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <ReceiptDetailsPanel receipt={receipt} />
            <ReceiptFilePreview fileUrl={previewFileUrl} receiptNumber={previewNumber} />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <ReceiptForm
              values={values}
              relatedOptions={relatedOptions}
              requiredFields={requiredFields}
              onFieldChange={onFieldChange}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
            <ReceiptFilePreview fileUrl={previewFileUrl} receiptNumber={previewNumber} />
          </div>
        )}

        {mode === "view" ? (
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cerrar
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
