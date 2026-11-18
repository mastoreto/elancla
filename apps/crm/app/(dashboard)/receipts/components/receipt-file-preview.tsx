import { FileImage, FileText, Paperclip } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReceiptFilePreviewProps {
  fileUrl?: string;
  receiptNumber?: string;
}

const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const pdfExtension = ".pdf";

function getFileName(fileUrl?: string) {
  if (!fileUrl) {
    return "";
  }

  const segments = fileUrl.split("/");
  return segments[segments.length - 1] ?? fileUrl;
}

function getPreviewVariant(fileUrl?: string) {
  const normalizedUrl = fileUrl?.toLowerCase() ?? "";

  if (normalizedUrl.endsWith(pdfExtension)) {
    return "pdf";
  }

  if (imageExtensions.some((extension) => normalizedUrl.endsWith(extension))) {
    return "image";
  }

  return "empty";
}

export function ReceiptFilePreview({ fileUrl, receiptNumber }: ReceiptFilePreviewProps) {
  const previewVariant = getPreviewVariant(fileUrl);
  const fileName = getFileName(fileUrl);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Vista previa de boleta</CardTitle>
        <CardDescription>
          {receiptNumber
            ? `Archivo asociado a la boleta ${receiptNumber}.`
            : "Adjunta una imagen o PDF para visualizar su referencia."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewVariant === "pdf" ? (
          <div className="from-rose-50 to-orange-50 dark:from-muted dark:to-muted/60 flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-gradient-to-br p-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              <FileText className="size-8" />
            </div>
            <p className="font-medium text-foreground">Vista previa de PDF</p>
            <p className="text-muted-foreground mt-1 text-sm">
              El archivo se mostrará aquí cuando se conecte el visor definitivo.
            </p>
          </div>
        ) : null}

        {previewVariant === "image" ? (
          <div className="from-sky-50 via-cyan-50 to-emerald-50 dark:from-muted dark:via-muted/80 dark:to-muted/60 flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-gradient-to-br p-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
              <FileImage className="size-8" />
            </div>
            <p className="font-medium text-foreground">Vista previa de imagen</p>
            <p className="text-muted-foreground mt-1 text-sm">
              La imagen adjunta se visualizará en este espacio.
            </p>
          </div>
        ) : null}

        {previewVariant === "empty" ? (
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <div className="space-y-2">
              <div className="bg-muted mx-auto flex size-14 items-center justify-center rounded-full">
                <Paperclip className="text-muted-foreground size-6" />
              </div>
              <p className="font-medium text-foreground">Sin archivo adjunto</p>
              <p className="text-muted-foreground text-sm">
                Cuando agregues una imagen o PDF, la vista previa aparecerá aquí.
              </p>
            </div>
          </div>
        ) : null}

        {fileName ? (
          <div className="bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm">
            <Paperclip className="text-muted-foreground size-4" />
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{fileName}</p>
              <p className="text-muted-foreground text-xs">Referencia del archivo adjunto</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
