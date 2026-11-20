"use client";

import type { EditorialInboxDto, InboxItemDto } from "@ancla/contracts";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const CONTENT_TYPE_LABELS: Record<InboxItemDto["contentType"], string> = {
  "blog-post": "Entrada del blog",
  ministry: "Perfil de ministerio",
  "simple-page": "Página del sitio",
};

const editorialInboxBellEditorialPage = {
  trigger: cn(
    "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-card text-foreground",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] transition hover:-translate-y-px md:size-[42px]",
  ),
  icon: cn("size-[17px]"),
  dot: cn("absolute top-2.5 right-2.5 size-2 rounded-full bg-primary ring-2 ring-card"),
  content: cn("w-80 rounded-[22px] border-0 bg-card p-4 shadow-(--sombra)"),
  group: cn("flex flex-col gap-1.5"),
  groupTitle: cn("text-[12px] font-bold tracking-wide text-[var(--tinta-suave)] uppercase"),
  list: cn("flex flex-col gap-1"),
  item: cn("flex flex-col rounded-[14px] px-3 py-2 text-sm hover:bg-secondary"),
  itemTitle: cn("font-semibold"),
  itemMeta: cn("text-xs text-[var(--tinta-suave)]"),
  itemComment: cn("text-xs text-foreground"),
  empty: cn("py-3 text-center text-sm text-[var(--tinta-apagada)]"),
  groups: cn("flex flex-col gap-4"),
};

interface InboxGroupProps {
  title: string;
  items: InboxItemDto[];
}

function InboxGroup({ title, items }: InboxGroupProps) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className={editorialInboxBellEditorialPage.group}>
      <h3 className={editorialInboxBellEditorialPage.groupTitle}>{title}</h3>
      <ul className={editorialInboxBellEditorialPage.list}>
        {items.map((item) => (
          <li key={item.revisionId}>
            <Link className={editorialInboxBellEditorialPage.item} href={item.crmPath}>
              <span className={editorialInboxBellEditorialPage.itemTitle}>
                {CONTENT_TYPE_LABELS[item.contentType]}
              </span>
              <span className={editorialInboxBellEditorialPage.itemMeta}>
                {item.author.name} · versión {item.number}
              </span>
              {item.comment ? (
                <span className={editorialInboxBellEditorialPage.itemComment}>
                  “{item.comment}”
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface EditorialInboxBellProps {
  /** `null` when the inbox could not be loaded: the bell then shows nothing pending. */
  inbox: EditorialInboxDto | null;
}

/** The header bell: a dot when something waits for the user, and what, in a popover. */
export function EditorialInboxBell({ inbox }: EditorialInboxBellProps) {
  const toReview = inbox?.toReview ?? [];
  const changesRequested = inbox?.changesRequested ?? [];
  const pending = toReview.length + changesRequested.length;

  return (
    <Popover>
      <PopoverTrigger asChild={true}>
        <button
          aria-label="Notificaciones"
          className={editorialInboxBellEditorialPage.trigger}
          type="button"
        >
          <Bell aria-hidden="true" className={editorialInboxBellEditorialPage.icon} />
          {pending > 0 ? (
            <span
              className={editorialInboxBellEditorialPage.dot}
              data-testid="editorial-inbox-dot"
            />
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className={editorialInboxBellEditorialPage.content}>
        {pending === 0 ? (
          <p className={editorialInboxBellEditorialPage.empty}>No tenés pendientes</p>
        ) : (
          <div className={editorialInboxBellEditorialPage.groups}>
            <InboxGroup items={toReview} title="Para revisar" />
            <InboxGroup items={changesRequested} title="Te pidieron cambios" />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
