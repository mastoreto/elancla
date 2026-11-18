import { ReceiptFilePreview } from "@/app/(dashboard)/receipts/components/receipt-file-preview";
import { ReceiptForm } from "@/app/(dashboard)/receipts/components/receipt-form";
import type {
  ReceiptFormField,
  ReceiptFormValues,
  ReceiptModalMode,
  ReceiptRelatedOption,
} from "@/app/(dashboard)/receipts/types/index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const receiptModalReceiptsPage = {
  layout: cn("grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"),
};

interface ReceiptModalProps {
  open: boolean;
  mode: ReceiptModalMode;
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

  return {
    title: "Editar boleta",
    description: "Actualiza los datos visibles y revisa el archivo asociado antes de guardar.",
  };
}

export function ReceiptModal({
  open,
  mode,
  values,
  relatedOptions,
  requiredFields,
  onOpenChange,
  onFieldChange,
  onSubmit,
  onCancel,
}: ReceiptModalProps) {
  const dialogCopy = getDialogCopy(mode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{dialogCopy.title}</DialogTitle>
          <DialogDescription>{dialogCopy.description}</DialogDescription>
        </DialogHeader>

        <div className={receiptModalReceiptsPage.layout}>
          <ReceiptForm
            values={values}
            relatedOptions={relatedOptions}
            requiredFields={requiredFields}
            onFieldChange={onFieldChange}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
          <ReceiptFilePreview fileUrl={values.fileUrl} receiptNumber={values.number} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
