import { NoticeEmail } from "../../templates/notice-email";
import type { EmailTone } from "../../theme";
import type { RenderedEmail } from "../renderBoth";
import { renderBoth } from "../renderBoth";

export type EditorialNoticeVariant =
  | "submitted"
  | "approved"
  | "changesRequested";

export interface EditorialNoticeInput {
  variant: EditorialNoticeVariant;
  churchName: string;
  recipientEmail: string;
  /** What the content is, e.g. "una entrada del blog". */
  contentLabel: string;
  /** Who acted: the author when it is submitted, the reviewer otherwise. */
  actorName: string;
  /** The reviewer's comment, shown when they ask for changes. */
  comment?: string | null;
  /** Where the button leads: the content in the CRM. */
  actionUrl: string;
}

interface VariantCopy {
  tone: EmailTone;
  glyph: string;
  subject: string;
  title: string;
  message: string;
  actionLabel: string;
}

const copyOf = (
  variant: EditorialNoticeVariant,
  { contentLabel, actorName }: EditorialNoticeInput,
): VariantCopy => {
  switch (variant) {
    case "submitted":
      return {
        tone: "gold",
        glyph: "!",
        subject: `${actorName} envió ${contentLabel} a revisión`,
        title: `Hay ${contentLabel} esperando tu revisión`,
        message: `${actorName} envió ${contentLabel} para que la revises.`,
        actionLabel: "Revisar",
      };
    case "approved":
      return {
        tone: "green",
        glyph: "✓",
        subject: `Aprobaron ${contentLabel} y ya está publicado`,
        title: "Tu contenido fue aprobado",
        message: `${actorName} aprobó ${contentLabel} y ya está publicado.`,
        actionLabel: "Ver contenido",
      };
    case "changesRequested":
      return {
        tone: "rose",
        glyph: "!",
        subject: `Te pidieron cambios en ${contentLabel}`,
        title: "Te pidieron cambios",
        message: `${actorName} pidió cambios en ${contentLabel} antes de publicarlo.`,
        actionLabel: "Corregir contenido",
      };
  }
};

export function renderEditorialNoticeEmail(
  input: EditorialNoticeInput,
): Promise<RenderedEmail> {
  const copy = copyOf(input.variant, input);
  const comment = input.comment?.trim();
  return renderBoth(
    copy.subject,
    <NoticeEmail
      actionLabel={copy.actionLabel}
      actionUrl={input.actionUrl}
      churchName={input.churchName}
      details={comment ? [{ label: "Comentario", value: comment }] : undefined}
      glyph={copy.glyph}
      message={copy.message}
      recipientEmail={input.recipientEmail}
      title={copy.title}
      tone={copy.tone}
    />,
  );
}
