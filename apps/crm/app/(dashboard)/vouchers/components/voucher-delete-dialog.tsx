import { TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const voucherDeleteDialogVouchersPage = {
  icon: cn(
    "bg-warning-surface text-warning mb-4 flex size-12 items-center justify-center rounded-full",
  ),
  confirm: cn("bg-destructive text-white hover:bg-destructive/90"),
};

interface VoucherDeleteDialogProps {
  open: boolean;
  voucherDescription?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VoucherDeleteDialog({
  open,
  voucherDescription,
  onOpenChange,
  onConfirm,
  onCancel,
}: VoucherDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className={voucherDeleteDialogVouchersPage.icon}>
            <TriangleAlert className="size-6" />
          </div>
          <AlertDialogTitle>Eliminar comprobante</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">¿Estás seguro que deseas eliminar este comprobante?</span>
            {voucherDescription ? (
              <span className="text-muted-foreground block text-xs">
                {`Comprobante seleccionado: ${voucherDescription}`}
              </span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={voucherDeleteDialogVouchersPage.confirm}
            onClick={onConfirm}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
