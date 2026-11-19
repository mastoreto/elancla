"use client";

import { MEDIA_PURPOSES, type MediaFileDto } from "@ancla/contracts";
import { Upload } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { MediaUploadError, type MediaUploadErrorKind, uploadMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = MEDIA_PURPOSES.contentImage.contentTypes.join(",");

const contentImageDropzoneDashboardPage = {
  container: cn("flex w-full flex-col gap-2"),
  label: cn("text-[13px] font-bold text-tinta-suave"),
  zone: cn(
    "relative flex h-[170px] w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[26px] border-2 border-dashed border-oro bg-oro-50 px-4 text-center transition",
    "bg-[repeating-linear-gradient(135deg,rgba(42,21,26,0.035)_0_1px,transparent_1px_9px)] hover:bg-oro-100/40",
    "disabled:cursor-progress disabled:opacity-70",
  ),
  zoneError: cn("border-primary"),
  zoneDragging: cn("bg-oro-100/60"),
  preview: cn("object-cover"),
  previewCaption: cn(
    "absolute inset-x-3 bottom-3 truncate rounded-full bg-background/90 px-3 py-1 text-xs font-bold",
  ),
  bubble: cn("size-10"),
  icon: cn("size-[18px]"),
  title: cn("text-sm font-bold"),
  hint: cn("text-[12.5px] text-tinta-suave"),
  error: cn("text-xs font-semibold text-primary"),
  input: cn("sr-only"),
};

const UPLOAD_ERROR_MESSAGES = {
  unsupportedType: "Ese tipo de archivo no está permitido. Usa JPG, PNG, WebP o AVIF.",
  tooLarge: "La imagen es demasiado grande (máximo 15 MB).",
  forbidden: "Tu rol no permite subir imágenes.",
  rejected: "El archivo no es una imagen válida. Prueba con otro.",
  uploadFailed: "No se pudo subir la imagen. Revisa tu conexión e inténtalo de nuevo.",
  unknown: "No se pudo procesar la imagen. Inténtalo de nuevo.",
} satisfies Record<MediaUploadErrorKind, string>;

function describeUploadError(error: unknown): string {
  const kind = error instanceof MediaUploadError ? error.kind : "unknown";
  return UPLOAD_ERROR_MESSAGES[kind];
}

/** The lightest variant that exists: enough for a thumbnail, cheap to load. */
function smallestPreviewUrl(file: MediaFileDto): string | null {
  const webp = file.variants.filter((variant) => variant.format === "webp");
  const smallest = webp.sort((a, b) => a.width - b.width)[0];
  return smallest?.url ?? null;
}

const uploadContentImage = (file: File): Promise<MediaFileDto> =>
  uploadMedia({ file, purpose: "contentImage" });

interface ContentImageDropzoneProps {
  id: string;
  label: string;
  /** "Arrastra una imagen" / "Arrastra la portada". */
  title: string;
  /** "JPG o PNG · 1600×900". */
  hint: string;
  fileName: string;
  onFileNameChange: (name: string) => void;
  error?: string;
  /** Injected for tests and stories; uploads to the `contentImage` purpose by default. */
  uploadFile?: (file: File) => Promise<MediaFileDto>;
}

/**
 * Image slot for hero and cover pictures. It uploads for real (quarantine, verification, variants)
 * and previews the result; the form still only keeps the file name until posts are saved (1.4).
 */
export function ContentImageDropzone({
  id,
  label,
  title,
  hint,
  fileName,
  onFileNameChange,
  error,
  uploadFile = uploadContentImage,
}: ContentImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const message = uploadError ?? error;

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await uploadFile(file);
      setPreviewUrl(smallestPreviewUrl(uploaded));
      onFileNameChange(file.name);
    } catch (caught) {
      setUploadError(describeUploadError(caught));
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Clearing lets the user pick the same file again after an error.
    event.target.value = "";
    if (file) void handleFile(file);
  }

  return (
    <div className={contentImageDropzoneDashboardPage.container}>
      <span className={contentImageDropzoneDashboardPage.label}>{label}</span>
      <button
        aria-busy={uploading}
        aria-describedby={message ? `${id}-error` : undefined}
        className={cn(
          contentImageDropzoneDashboardPage.zone,
          message && contentImageDropzoneDashboardPage.zoneError,
          dragging && contentImageDropzoneDashboardPage.zoneDragging,
        )}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDrop={handleDrop}
        type="button"
      >
        {previewUrl ? (
          <>
            <Image
              alt={fileName}
              className={contentImageDropzoneDashboardPage.preview}
              fill={true}
              sizes="480px"
              src={previewUrl}
              unoptimized={true}
            />
            <span className={contentImageDropzoneDashboardPage.previewCaption}>{fileName}</span>
          </>
        ) : (
          <>
            <IconBubble className={contentImageDropzoneDashboardPage.bubble} tone="gold">
              <Upload aria-hidden="true" className={contentImageDropzoneDashboardPage.icon} />
            </IconBubble>
            <b className={contentImageDropzoneDashboardPage.title}>
              {uploading ? "Subiendo…" : fileName || title}
            </b>
            <span className={contentImageDropzoneDashboardPage.hint}>{hint}</span>
          </>
        )}
      </button>
      <input
        accept={ACCEPTED_TYPES}
        className={contentImageDropzoneDashboardPage.input}
        id={id}
        onChange={handleInputChange}
        ref={inputRef}
        type="file"
      />
      {message ? (
        <span
          className={contentImageDropzoneDashboardPage.error}
          id={`${id}-error`}
          role={uploadError ? "alert" : undefined}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}
