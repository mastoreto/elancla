"use client";

import type { MediaFileDto } from "@ancla/contracts";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { ContentImageDropzone } from "@/components/dashboard/content";
import { uploadMedia } from "@/lib/media";
import { cn } from "@/lib/utils";
import { PersonAvatar } from "../person-avatar";

const personPhotoFieldWebsitePage = {
  container: cn("flex flex-col gap-3"),
  current: cn("flex items-center gap-4"),
  name: cn("flex-1 truncate text-sm text-[var(--tinta-suave)]"),
};

interface PersonPhotoFieldProps {
  personName: string;
  photo: MediaFileDto | null;
  onChange: (photo: MediaFileDto | null) => void;
  canEdit: boolean;
}

/** Current photo with a remove button, plus the dropzone to upload a new one. */
export function PersonPhotoField({ personName, photo, onChange, canEdit }: PersonPhotoFieldProps) {
  // The dropzone only reports a file name; this wrapper keeps the verified file so the form can
  // send its id.
  async function uploadPhoto(file: File): Promise<MediaFileDto> {
    const uploaded = await uploadMedia({ file, purpose: "contentImage" });
    onChange(uploaded);
    return uploaded;
  }

  return (
    <div className={personPhotoFieldWebsitePage.container}>
      {photo ? (
        <div className={personPhotoFieldWebsitePage.current}>
          <PersonAvatar name={personName} photo={photo} size="lg" />
          <span className={personPhotoFieldWebsitePage.name}>{photo.originalName}</span>
          {canEdit ? (
            <BoardButton onClick={() => onChange(null)} size="sm" variant="outline">
              Quitar foto
            </BoardButton>
          ) : null}
        </div>
      ) : null}
      {canEdit ? (
        <ContentImageDropzone
          fileName=""
          hint="JPG, PNG, WebP o AVIF"
          id="person-photo"
          label="Foto"
          onFileNameChange={() => undefined}
          title={photo ? "Arrastra una foto nueva" : "Arrastra una foto"}
          uploadFile={uploadPhoto}
        />
      ) : null}
    </div>
  );
}
