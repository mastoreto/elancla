"use client";

import {
  BLOG_LINK_CARD_DESCRIPTION_MAX_LENGTH,
  BLOG_LINK_CARD_HREF_PATTERN,
  BLOG_LINK_CARD_SOURCE_MAX_LENGTH,
  BLOG_LINK_CARD_TITLE_MAX_LENGTH,
  BLOG_LINK_CARDS_MAX_ITEMS,
  RICH_TEXT_HREF_MAX_LENGTH,
} from "@ancla/contracts";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { DialogSubmit, LinkCardItem } from "../../types";

const linkCardsDialogBlogPage = {
  body: cn("flex flex-col gap-4"),
  card: cn("flex flex-col gap-3 rounded-[22px] bg-secondary p-4"),
  cardHeader: cn("flex items-center justify-between"),
  cardTitle: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  icon: cn("size-4"),
  actions: cn("flex justify-end gap-2"),
};

interface DraftCard {
  title: string;
  href: string;
  description: string;
  sourceLabel: string;
}

const EMPTY_CARD: DraftCard = { title: "", href: "", description: "", sourceLabel: "" };

function toDraft(item: LinkCardItem): DraftCard {
  return {
    title: item.title,
    href: item.href,
    description: item.description ?? "",
    sourceLabel: item.sourceLabel ?? "",
  };
}

function toItem(card: DraftCard): LinkCardItem {
  return {
    title: card.title.trim(),
    href: card.href.trim(),
    description: card.description.trim() || null,
    sourceLabel: card.sourceLabel.trim() || null,
  };
}

function isCardValid(card: DraftCard): boolean {
  return card.title.trim() !== "" && BLOG_LINK_CARD_HREF_PATTERN.test(card.href.trim());
}

interface LinkCardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing an existing block. */
  initial?: readonly LinkCardItem[];
  onSubmit: DialogSubmit<LinkCardItem[]>;
}

interface LinkCardsFormProps extends Pick<LinkCardsDialogProps, "initial" | "onSubmit"> {
  onClose: () => void;
}

function LinkCardsForm({ initial, onSubmit, onClose }: LinkCardsFormProps) {
  const [cards, setCards] = useState<DraftCard[]>(
    initial && initial.length > 0 ? initial.map(toDraft) : [EMPTY_CARD],
  );
  const [showErrors, setShowErrors] = useState(false);

  const updateCard = (index: number, patch: Partial<DraftCard>) =>
    setCards((previous) =>
      previous.map((card, position) => (position === index ? { ...card, ...patch } : card)),
    );

  function confirm(): void {
    if (!cards.every(isCardValid)) {
      setShowErrors(true);
      return;
    }
    onSubmit(cards.map(toItem));
    onClose();
  }

  return (
    <BoardDialogContent
      description={`Hasta ${BLOG_LINK_CARDS_MAX_ITEMS} recursos externos. Solo enlaces http(s).`}
      title={initial ? "Editar tarjetas de enlaces" : "Insertar tarjetas de enlaces"}
    >
      <div className={linkCardsDialogBlogPage.body}>
        {cards.map((card, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: the cards have no id and only this list reorders them.
          <div className={linkCardsDialogBlogPage.card} key={index}>
            <div className={linkCardsDialogBlogPage.cardHeader}>
              <span className={linkCardsDialogBlogPage.cardTitle}>Tarjeta {index + 1}</span>
              {cards.length > 1 ? (
                <BoardButton
                  aria-label={`Quitar tarjeta ${index + 1}`}
                  onClick={() => setCards((previous) => previous.filter((_, i) => i !== index))}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" className={linkCardsDialogBlogPage.icon} />
                </BoardButton>
              ) : null}
            </div>
            <BoardInput
              error={showErrors && !card.title.trim() ? "Escribe un título." : undefined}
              id={`blog-link-title-${index}`}
              label="Título"
              maxLength={BLOG_LINK_CARD_TITLE_MAX_LENGTH}
              onChange={(event) => updateCard(index, { title: event.target.value })}
              value={card.title}
            />
            <BoardInput
              error={
                showErrors && !BLOG_LINK_CARD_HREF_PATTERN.test(card.href.trim())
                  ? "El enlace debe empezar con http:// o https://"
                  : undefined
              }
              id={`blog-link-href-${index}`}
              label="Enlace"
              maxLength={RICH_TEXT_HREF_MAX_LENGTH}
              onChange={(event) => updateCard(index, { href: event.target.value })}
              value={card.href}
            />
            <BoardInput
              id={`blog-link-description-${index}`}
              label="Descripción (opcional)"
              maxLength={BLOG_LINK_CARD_DESCRIPTION_MAX_LENGTH}
              onChange={(event) => updateCard(index, { description: event.target.value })}
              value={card.description}
            />
            <BoardInput
              id={`blog-link-source-${index}`}
              label="Fuente (opcional)"
              maxLength={BLOG_LINK_CARD_SOURCE_MAX_LENGTH}
              onChange={(event) => updateCard(index, { sourceLabel: event.target.value })}
              value={card.sourceLabel}
            />
          </div>
        ))}
        {cards.length < BLOG_LINK_CARDS_MAX_ITEMS ? (
          <BoardButton onClick={() => setCards((previous) => [...previous, EMPTY_CARD])}>
            <Plus aria-hidden="true" className={linkCardsDialogBlogPage.icon} />
            Agregar tarjeta
          </BoardButton>
        ) : null}
        <div className={linkCardsDialogBlogPage.actions}>
          <BoardButton onClick={onClose} variant="ghost">
            Cancelar
          </BoardButton>
          <BoardButton onClick={confirm} variant="primary">
            {initial ? "Guardar" : "Insertar"}
          </BoardButton>
        </div>
      </div>
    </BoardDialogContent>
  );
}

export function LinkCardsDialog({ open, onOpenChange, initial, onSubmit }: LinkCardsDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <LinkCardsForm initial={initial} onClose={() => onOpenChange(false)} onSubmit={onSubmit} />
    </Dialog>
  );
}
