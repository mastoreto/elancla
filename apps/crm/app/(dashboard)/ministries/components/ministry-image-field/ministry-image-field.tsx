"use client";

import type { MediaFileDto } from "@ancla/contracts";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { ContentImageDropzone } from "@/components/dashboard/content";
import { uploadMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

const ministryImageFieldMinistriesPage = {
  container: cn("flex flex-col gap-2"),
  hint: cn("text-xs text-[var(--tinta-apagada)]"),
  error: cn("text-xs font-semibold text-primary"),
  actions: cn("flex"),
};

interface MinistryImageFieldProps {
  /** Id of the field and of its dropzone; unique on the page. */
  id: string;
  label: string;
  title: string;
  hint: string;
  /** Id of the stored picture; empty when there is none. */
  mediaId: string;
  error?: string;
  disabled: boolean;
  onChange: (mediaId: string) => void;
}

/** A content image of the profile (cover or social card): upload it, or take it off. */
export function MinistryImageField({
  id,
  label,
  title,
  hint,
  mediaId,
  error,
  disabled,
  onChange,
}: MinistryImageFieldProps) {
  // The dropzone only reports a file name; this wrapper keeps the verified file so the form can
  // send its id.
  async function uploadImage(file: File): Promise<MediaFileDto> {
    const uploaded = await uploadMedia({ file, purpose: "contentImage" });
    onChange(uploaded.id);
    return uploaded;
  }

  return (
    <div className={ministryImageFieldMinistriesPage.container} data-testid={id}>
      {disabled ? null : (
        <ContentImageDropzone
          fileName={mediaId ? "Foto cargada" : ""}
          hint={hint}
          id={`${id}-dropzone`}
          label={label}
          onFileNameChange={() => undefined}
          title={title}
          uploadFile={uploadImage}
        />
      )}
      {mediaId ? (
        <div className={ministryImageFieldMinistriesPage.actions}>
          <span className={ministryImageFieldMinistriesPage.hint}>
            {disabled ? `${label}: cargada.` : "Foto cargada. Sube otra para reemplazarla."}
          </span>
          {disabled ? null : (
            <BoardButton onClick={() => onChange("")} variant="ghost">
              Quitar
            </BoardButton>
          )}
        </div>
      ) : null}
      {error ? <span className={ministryImageFieldMinistriesPage.error}>{error}</span> : null}
    </div>
  );
}
