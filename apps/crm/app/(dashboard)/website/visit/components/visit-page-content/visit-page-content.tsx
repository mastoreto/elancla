"use client";

import { PERMISSIONS, type VisitContentDto } from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormCard,
  BoardFormDivider,
  BoardFormFooter,
  BoardFormSection,
  BoardFormSections,
} from "@/components/dashboard/board/board-form";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { cn } from "@/lib/utils";
import { useSaveVisit } from "../../hooks/useSaveVisit";
import type { DirectionKey, VisitFormValues } from "../../types";
import { addFaq, moveFaq, removeFaq } from "../../utils/faqList";
import { hasVisitErrors, validateVisitForm } from "../../utils/validateVisitForm";
import { toUpdateVisitBody, toVisitFormValues } from "../../utils/visitFormValues";
import { DirectionsSection } from "../directions-section";
import { FaqSection } from "../faq-section";

const visitPageContentWebsitePage = {
  notes: cn("flex flex-col gap-1 text-[13px] text-[var(--tinta-suave)]"),
};

interface VisitPageContentProps {
  content: VisitContentDto;
}

export function VisitPageContent({ content }: VisitPageContentProps) {
  const access = useAccess();
  const { locales, defaultLocale } = content;
  const [values, setValues] = useState<VisitFormValues>(() => toVisitFormValues(content));
  const [showErrors, setShowErrors] = useState(false);
  const { saving, save } = useSaveVisit();

  const canEdit = can(access, PERMISSIONS.visit.edit);
  const errors = validateVisitForm(values, { locales, defaultLocale });
  const visibleErrors = showErrors ? errors : { directions: {}, faqs: {} };

  const updateDirection = (key: DirectionKey, locale: string, text: string) =>
    setValues((previous) => ({
      ...previous,
      directions: {
        ...previous.directions,
        [key]: { ...previous.directions[key], [locale]: text },
      },
    }));

  const updateFaqs = (update: (faqs: VisitFormValues["faqs"]) => VisitFormValues["faqs"]) =>
    setValues((previous) => ({ ...previous, faqs: update(previous.faqs) }));

  async function submit(): Promise<void> {
    if (hasVisitErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      return;
    }
    await save(toUpdateVisitBody(values, locales));
  }

  return (
    <BoardFormCard
      subtitle="Indicaciones y preguntas frecuentes de la página Visítanos."
      title="Visítanos"
    >
      <BoardFormSections>
        <BoardFormSection>
          <div className={visitPageContentWebsitePage.notes}>
            <span>
              Las preguntas de horario y dirección se generan solas a partir de los datos del sitio.
            </span>
            <span>
              {"En las respuestas podés usar {worshipEnd} (hora de fin del culto) y {email}."}
            </span>
          </div>
        </BoardFormSection>
        <BoardFormDivider />
        <BoardFormSection>
          <DirectionsSection
            defaultLocale={defaultLocale}
            directions={values.directions}
            disabled={!canEdit}
            errors={visibleErrors.directions}
            locales={locales}
            onChange={updateDirection}
          />
        </BoardFormSection>
        <BoardFormDivider />
        <BoardFormSection>
          <FaqSection
            defaultLocale={defaultLocale}
            disabled={!canEdit}
            errors={visibleErrors.faqs}
            faqs={values.faqs}
            locales={locales}
            onAdd={() => updateFaqs((faqs) => addFaq(faqs, crypto.randomUUID()))}
            onChange={(key, patch) =>
              updateFaqs((faqs) =>
                faqs.map((faq) => (faq.key === key ? { ...faq, ...patch } : faq)),
              )
            }
            onMove={(key, direction) => updateFaqs((faqs) => moveFaq(faqs, key, direction))}
            onRemove={(key) => updateFaqs((faqs) => removeFaq(faqs, key))}
          />
        </BoardFormSection>
      </BoardFormSections>
      {canEdit ? (
        <BoardFormFooter>
          <BoardButton disabled={saving} onClick={() => void submit()} variant="primary">
            {saving ? "Guardando…" : "Guardar"}
          </BoardButton>
        </BoardFormFooter>
      ) : null}
    </BoardFormCard>
  );
}
