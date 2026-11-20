"use client";

import {
  BLOG_COVER_ALT_MAX_LENGTH,
  BLOG_COVER_GLYPHS,
  BLOG_COVER_TINTS,
  type BlogCoverGlyph,
  type BlogCoverTint,
  type MediaFileDto,
} from "@ancla/contracts";
import { Image as ImageIcon, Shapes } from "lucide-react";
import { BoardFormRow, BoardInput, BoardSelect } from "@/components/dashboard/board/board-form";
import {
  type SegmentedOption,
  SegmentedToggle,
} from "@/components/dashboard/board/segmented-toggle";
import { ContentImageDropzone } from "@/components/dashboard/content";
import { uploadMedia } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { PostCoverValues } from "../../types";

const COVER_GLYPH_LABELS: Record<BlogCoverGlyph, string> = {
  anchor: "Ancla",
  cross: "Cruz",
  book: "Libro",
  dove: "Paloma",
  flame: "Llama",
  lamp: "Lámpara",
  wheat: "Trigo",
  water: "Agua",
  path: "Camino",
  bread: "Pan",
};

const COVER_TINT_LABELS: Record<BlogCoverTint, string> = {
  paper: "Papel",
  cream: "Crema",
  stone: "Piedra",
  sand: "Arena",
};

const GLYPH_OPTIONS = BLOG_COVER_GLYPHS.map((glyph) => ({
  value: glyph,
  label: COVER_GLYPH_LABELS[glyph],
}));
const TINT_OPTIONS = BLOG_COVER_TINTS.map((tint) => ({
  value: tint,
  label: COVER_TINT_LABELS[tint],
}));

const postCoverFieldBlogPage = {
  container: cn("flex flex-col gap-3"),
  legend: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  error: cn("text-xs font-semibold text-primary"),
};

const KIND_OPTIONS: SegmentedOption<PostCoverValues["kind"]>[] = [
  { value: "design", label: "Diseño", icon: Shapes },
  { value: "photo", label: "Foto", icon: ImageIcon },
];

/** The smallest webp variant: enough for the thumbnail. */
function previewUrlOf(file: MediaFileDto): string | null {
  const [smallest] = file.variants
    .filter((variant) => variant.format === "webp")
    .sort((a, b) => a.width - b.width);
  return smallest?.url ?? null;
}

interface PostCoverFieldProps {
  cover: PostCoverValues;
  disabled: boolean;
  error?: string;
  onChange: (patch: Partial<PostCoverValues>) => void;
}

/** A photo uploaded as content image, or a design cover made of a glyph on a tint. */
export function PostCoverField({ cover, disabled, error, onChange }: PostCoverFieldProps) {
  // The dropzone only reports a file name; this wrapper keeps the verified file so the form can
  // send its id.
  async function uploadCover(file: File): Promise<MediaFileDto> {
    const uploaded = await uploadMedia({ file, purpose: "contentImage" });
    onChange({ mediaId: uploaded.id, previewUrl: previewUrlOf(uploaded) });
    return uploaded;
  }

  return (
    <div className={postCoverFieldBlogPage.container} data-testid="post-cover">
      <span className={postCoverFieldBlogPage.legend}>Portada</span>
      <SegmentedToggle
        label="Tipo de portada"
        onValueChange={(kind) => onChange({ kind })}
        options={KIND_OPTIONS}
        value={cover.kind}
      />
      {cover.kind === "design" ? (
        <BoardFormRow>
          <BoardSelect
            disabled={disabled}
            id="post-cover-glyph"
            label="Símbolo"
            onValueChange={(glyph) => onChange({ glyph: glyph as BlogCoverGlyph })}
            options={GLYPH_OPTIONS}
            value={cover.glyph}
          />
          <BoardSelect
            disabled={disabled}
            id="post-cover-tint"
            label="Fondo"
            onValueChange={(tint) => onChange({ tint: tint as BlogCoverTint })}
            options={TINT_OPTIONS}
            value={cover.tint}
          />
        </BoardFormRow>
      ) : (
        <>
          {disabled ? null : (
            <ContentImageDropzone
              fileName={cover.mediaId ? "Foto cargada" : ""}
              hint="JPG, PNG, WebP o AVIF"
              id="post-cover-photo"
              label="Foto de portada"
              onFileNameChange={() => undefined}
              title="Arrastra la portada"
              uploadFile={uploadCover}
            />
          )}
          <BoardInput
            disabled={disabled}
            id="post-cover-alt"
            label="Texto alternativo"
            maxLength={BLOG_COVER_ALT_MAX_LENGTH}
            onChange={(event) => onChange({ alt: event.target.value })}
            value={cover.alt}
          />
        </>
      )}
      {error ? <span className={postCoverFieldBlogPage.error}>{error}</span> : null}
    </div>
  );
}
