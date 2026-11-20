import { VISIT_FAQ_ANSWER_MAX_LENGTH, VISIT_FAQ_QUESTION_MAX_LENGTH } from "@ancla/contracts";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { LocalizedTextField } from "@/components/content/localized-text-field";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { cn } from "@/lib/utils";
import type { FaqFormErrors, FaqFormValues, SiteLocales } from "../../types";

const faqItemWebsitePage = {
  container: cn("flex flex-col gap-4 rounded-2xl border border-border p-4"),
  header: cn("flex items-center justify-between gap-3"),
  position: cn("text-sm font-semibold text-[var(--tinta-suave)]"),
  actions: cn("flex items-center gap-1.5"),
  icon: cn("size-4"),
};

interface FaqItemProps extends SiteLocales {
  faq: FaqFormValues;
  /** 0-based position in the list. */
  index: number;
  isFirst: boolean;
  isLast: boolean;
  errors: FaqFormErrors | undefined;
  disabled: boolean;
  onChange: (patch: Pick<FaqFormValues, "questions" | "answers">) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
}

export function FaqItem({
  faq,
  index,
  isFirst,
  isLast,
  errors,
  disabled,
  onChange,
  onMove,
  onRemove,
  locales,
  defaultLocale,
}: FaqItemProps) {
  const number = index + 1;
  return (
    <div className={faqItemWebsitePage.container}>
      <div className={faqItemWebsitePage.header}>
        <span className={faqItemWebsitePage.position}>Pregunta {number}</span>
        {disabled ? null : (
          <div className={faqItemWebsitePage.actions}>
            <BoardButton
              aria-label={`Subir la pregunta ${number}`}
              disabled={isFirst}
              onClick={() => onMove("up")}
              size="sm"
              variant="ghost"
            >
              <ArrowUp aria-hidden="true" className={faqItemWebsitePage.icon} />
            </BoardButton>
            <BoardButton
              aria-label={`Bajar la pregunta ${number}`}
              disabled={isLast}
              onClick={() => onMove("down")}
              size="sm"
              variant="ghost"
            >
              <ArrowDown aria-hidden="true" className={faqItemWebsitePage.icon} />
            </BoardButton>
            <BoardButton
              aria-label={`Quitar la pregunta ${number}`}
              onClick={onRemove}
              size="sm"
              variant="ghost"
            >
              <Trash2 aria-hidden="true" className={faqItemWebsitePage.icon} />
            </BoardButton>
          </div>
        )}
      </div>
      {/* ponytail: question and answer each keep their own language tabs instead of sharing one. */}
      <LocalizedTextField
        defaultLocale={defaultLocale}
        disabled={disabled}
        error={errors?.question}
        id={`faq-${faq.key}-question`}
        label="Pregunta"
        locales={locales}
        maxLength={VISIT_FAQ_QUESTION_MAX_LENGTH}
        onChange={(locale, value) =>
          onChange({ questions: { ...faq.questions, [locale]: value }, answers: faq.answers })
        }
        tabsLabel={`Idioma de la pregunta ${number}`}
        values={faq.questions}
      />
      <LocalizedTextField
        defaultLocale={defaultLocale}
        disabled={disabled}
        error={errors?.answer}
        id={`faq-${faq.key}-answer`}
        label="Respuesta"
        locales={locales}
        maxLength={VISIT_FAQ_ANSWER_MAX_LENGTH}
        multiline={true}
        onChange={(locale, value) =>
          onChange({ questions: faq.questions, answers: { ...faq.answers, [locale]: value } })
        }
        tabsLabel={`Idioma de la respuesta ${number}`}
        values={faq.answers}
      />
    </div>
  );
}
