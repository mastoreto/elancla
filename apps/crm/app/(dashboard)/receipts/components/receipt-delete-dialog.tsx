import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReceiptDeleteDialogProps {
  open: boolean;
  receiptNumber?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReceiptDeleteDialog({
  open,
  receiptNumber,
  onOpenChange,
  onConfirm,
  onCancel,
}: ReceiptDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="bg-warning-surface text-warning mb-4 flex size-12 items-center justify-center rounded-full">
            <TriangleAlert className="size-6" />
          </div>
          <DialogTitle>Eliminar boleta</DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">¿Estás seguro que deseas eliminar esta boleta?</span>
            {receiptNumber ? (
              <span className="text-muted-foreground block text-xs">
                {`Boleta seleccionada: ${receiptNumber}`}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
