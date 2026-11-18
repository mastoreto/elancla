import { VoucherForm } from "@/app/(dashboard)/vouchers/components/voucher-form";
import { VoucherGuidanceCard } from "@/app/(dashboard)/vouchers/components/voucher-guidance-card";
import type {
  VoucherFormField,
  VoucherFormValues,
  VoucherModalMode,
  VoucherRelatedOption,
} from "@/app/(dashboard)/vouchers/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const voucherModalVouchersPage = {
  content: cn("max-h-[90vh] overflow-y-auto sm:max-w-5xl"),
  layout: cn("grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"),
};

interface VoucherModalProps {
  open: boolean;
  mode: VoucherModalMode;
  values: VoucherFormValues;
  relatedOptions: VoucherRelatedOption[];
  requiredFields?: VoucherFormField[];
  onOpenChange: (open: boolean) => void;
  onFieldChange: (field: VoucherFormField, value: VoucherFormValues[VoucherFormField]) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function getDialogCopy(mode: VoucherModalMode) {
  if (mode === "create") {
    return {
      title: "Crear comprobante",
      description:
        "Registra una justificación manual del gasto para casos donde no exista boleta disponible.",
    };
  }

  return {
    title: "Editar comprobante",
    description:
      "Actualiza los datos visibles y deja preparada la justificación para controles posteriores.",
  };
}

export function VoucherModal({
  open,
  mode,
  values,
  relatedOptions,
  requiredFields,
  onOpenChange,
  onFieldChange,
  onSubmit,
  onCancel,
}: VoucherModalProps) {
  const dialogCopy = getDialogCopy(mode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={voucherModalVouchersPage.content} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{dialogCopy.title}</DialogTitle>
          <DialogDescription>{dialogCopy.description}</DialogDescription>
        </DialogHeader>

        <div className={voucherModalVouchersPage.layout}>
          <VoucherForm
            values={values}
            relatedOptions={relatedOptions}
            requiredFields={requiredFields}
            onFieldChange={onFieldChange}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
          <VoucherGuidanceCard />
        </div>
      </DialogContent>
    </Dialog>
  );
}
