import { MAX_VISIT_FAQS } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { cn } from "@/lib/utils";
import type { FaqFormValues, SiteLocales, VisitFormErrors } from "../../types";
import type { MoveDirection } from "../../utils/faqList";
import { FaqItem } from "../faq-item";

const faqSectionWebsitePage = {
  container: cn("flex flex-col gap-4"),
  heading: cn("flex flex-col gap-[3px]"),
  title: cn("font-display text-[17px] font-medium"),
  hint: cn("text-[13px] text-[var(--tinta-apagada)]"),
  empty: cn("py-4 text-center text-sm text-[var(--tinta-apagada)]"),
  list: cn("flex flex-col gap-3.5"),
  add: cn("self-start"),
  icon: cn("size-4"),
};

interface FaqSectionProps extends SiteLocales {
  faqs: readonly FaqFormValues[];
  errors: VisitFormErrors["faqs"];
  disabled: boolean;
  onAdd: () => void;
  onChange: (key: string, patch: Pick<FaqFormValues, "questions" | "answers">) => void;
  onMove: (key: string, direction: MoveDirection) => void;
  onRemove: (key: string) => void;
}

export function FaqSection({
  faqs,
  errors,
  disabled,
  onAdd,
  onChange,
  onMove,
  onRemove,
  locales,
  defaultLocale,
}: FaqSectionProps) {
  return (
    <div className={faqSectionWebsitePage.container}>
      <div className={faqSectionWebsitePage.heading}>
        <h3 className={faqSectionWebsitePage.title}>Preguntas frecuentes</h3>
        <span className={faqSectionWebsitePage.hint}>
          Aparecen en este orden, después de las que se generan solas. Máximo {MAX_VISIT_FAQS}.
        </span>
      </div>
      {faqs.length === 0 ? (
        <p className={faqSectionWebsitePage.empty}>Todavía no hay preguntas propias.</p>
      ) : (
        <div className={faqSectionWebsitePage.list}>
          {faqs.map((faq, index) => (
            <FaqItem
              defaultLocale={defaultLocale}
              disabled={disabled}
              errors={errors[faq.key]}
              faq={faq}
              index={index}
              isFirst={index === 0}
              isLast={index === faqs.length - 1}
              key={faq.key}
              locales={locales}
              onChange={(patch) => onChange(faq.key, patch)}
              onMove={(direction) => onMove(faq.key, direction)}
              onRemove={() => onRemove(faq.key)}
            />
          ))}
        </div>
      )}
      {disabled ? null : (
        <BoardButton
          className={faqSectionWebsitePage.add}
          disabled={faqs.length >= MAX_VISIT_FAQS}
          onClick={onAdd}
          variant="soft"
        >
          <Plus aria-hidden="true" className={faqSectionWebsitePage.icon} />
          Agregar pregunta
        </BoardButton>
      )}
    </div>
  );
}
