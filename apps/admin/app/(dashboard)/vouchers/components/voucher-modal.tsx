import { VoucherDetail } from "@/app/(dashboard)/vouchers/components/voucher-detail";
import { VoucherForm } from "@/app/(dashboard)/vouchers/components/voucher-form";
import { VoucherGuidancePanel } from "@/app/(dashboard)/vouchers/components/voucher-guidance-panel";
import type {
  Voucher,
  VoucherFormField,
  VoucherFormValues,
  VoucherModalMode,
  VoucherRelatedOption,
} from "@/app/(dashboard)/vouchers/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VoucherModalProps {
  open: boolean;
  mode: VoucherModalMode;
  voucher: Voucher | null;
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

  if (mode === "edit") {
    return {
      title: "Editar comprobante",
      description:
        "Actualiza los datos visibles y deja preparada la justificación para controles posteriores.",
    };
  }

  return {
    title: "Ver comprobante",
    description: "Consulta el detalle completo del comprobante y su justificación manual.",
  };
}

export function VoucherModal({
  open,
  mode,
  voucher,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{dialogCopy.title}</DialogTitle>
          <DialogDescription>{dialogCopy.description}</DialogDescription>
        </DialogHeader>

        {mode === "view" && voucher ? (
          <VoucherDetail voucher={voucher} />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <VoucherForm
              values={values}
              relatedOptions={relatedOptions}
              requiredFields={requiredFields}
              onFieldChange={onFieldChange}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
            <VoucherGuidancePanel />
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
