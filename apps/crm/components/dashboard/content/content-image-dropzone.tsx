"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { cn } from "@/lib/utils";

const contentImageDropzoneDashboardPage = {
  container: cn("flex w-full flex-col gap-[7px]"),
  label: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  zone: cn(
    "flex h-[170px] w-full flex-col items-center justify-center gap-1.5 rounded-[26px] border-2 border-dashed border-[var(--oro)] bg-(--oro-50) px-4 text-center transition",
    "bg-[repeating-linear-gradient(135deg,rgba(42,21,26,0.035)_0_1px,transparent_1px_9px)] hover:bg-[var(--oro-100)]/40",
  ),
  zoneError: cn("border-primary"),
  bubble: cn("size-10"),
  icon: cn("size-[18px]"),
  title: cn("text-sm font-bold"),
  hint: cn("text-[12.5px] text-[var(--tinta-suave)]"),
  error: cn("text-xs font-semibold text-primary"),
  input: cn("sr-only"),
};

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
}

/** Image slot for hero and cover pictures; keeps only the file name until uploads exist. */
export function ContentImageDropzone({
  id,
  label,
  title,
  hint,
  fileName,
  onFileNameChange,
  error,
}: ContentImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className={contentImageDropzoneDashboardPage.container}>
      <span className={contentImageDropzoneDashboardPage.label}>{label}</span>
      <button
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          contentImageDropzoneDashboardPage.zone,
          error && contentImageDropzoneDashboardPage.zoneError,
          dragging && "bg-[var(--oro-100)]/60",
        )}
        onClick={() => inputRef.current?.click()}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) onFileNameChange(file.name);
        }}
        type="button"
      >
        <IconBubble className={contentImageDropzoneDashboardPage.bubble} tone="gold">
          <Upload aria-hidden="true" className={contentImageDropzoneDashboardPage.icon} />
        </IconBubble>
        <b className={contentImageDropzoneDashboardPage.title}>{fileName || title}</b>
        <span className={contentImageDropzoneDashboardPage.hint}>{hint}</span>
      </button>
      <input
        accept="image/png,image/jpeg"
        className={contentImageDropzoneDashboardPage.input}
        id={id}
        onChange={(event) => onFileNameChange(event.target.files?.[0]?.name ?? "")}
        ref={inputRef}
        type="file"
      />
      {error ? (
        <span className={contentImageDropzoneDashboardPage.error} id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
