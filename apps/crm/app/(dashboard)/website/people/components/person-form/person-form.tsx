"use client";

import type { PersonProfileDto } from "@ancla/contracts";
import { PERMISSIONS, PERSON_BIO_MAX_LENGTH, PERSON_NAME_MAX_LENGTH } from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { LocalizedTextField } from "@/components/content/localized-text-field";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormCard,
  BoardFormDivider,
  BoardFormFooter,
  BoardFormSection,
  BoardFormSections,
  BoardInput,
} from "@/components/dashboard/board/board-form";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { getChurchRoutePath } from "@/lib/church";
import { PERSON_CONTEXT_LABELS } from "../../data/personContextLabels";
import { usePersonProfileActions } from "../../hooks/usePersonProfileActions";
import type { LinkableUser, PersonFormValues, SiteLocales } from "../../types";
import { toPersonFormValues, toUpsertPersonBody } from "../../utils/personFormValues";
import { hasFormErrors, validatePersonForm } from "../../utils/validatePersonForm";
import { PersonDeleteButton } from "../person-delete-button";
import { PersonPhotoField } from "../person-photo-field";
import { PersonUserField } from "../person-user-field";
import { RoleSection } from "../role-section";

interface PersonFormProps {
  /** `null` creates a new person. */
  person: PersonProfileDto | null;
  site: SiteLocales;
  users: readonly LinkableUser[];
}

export function PersonForm({ person, site, users }: PersonFormProps) {
  const access = useAccess();
  const [values, setValues] = useState<PersonFormValues>(() =>
    toPersonFormValues(person, site.locales),
  );
  const [showErrors, setShowErrors] = useState(false);
  const { busy, save, remove } = usePersonProfileActions(person?.id ?? null);

  const canEdit = can(access, person ? PERMISSIONS.people.edit : PERMISSIONS.people.create);
  const canDelete = person !== null && can(access, PERMISSIONS.people.delete);
  const errors = validatePersonForm(values, site);
  const visibleErrors = showErrors ? errors : {};

  const update = (patch: Partial<PersonFormValues>) =>
    setValues((previous) => ({ ...previous, ...patch }));

  async function submit(): Promise<void> {
    if (hasFormErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      return;
    }
    await save(toUpsertPersonBody(values, site.locales));
  }

  return (
    <BoardFormCard
      subtitle="Cómo aparece esta persona en el sitio público."
      title={person ? person.name : "Nueva persona"}
    >
      <BoardFormSections>
        <BoardFormSection>
          <BoardInput
            disabled={!canEdit}
            error={visibleErrors.name}
            id="person-name"
            label="Nombre"
            maxLength={PERSON_NAME_MAX_LENGTH}
            onChange={(event) => update({ name: event.target.value })}
            value={values.name}
          />
          <PersonPhotoField
            canEdit={canEdit}
            onChange={(photo) => update({ photo })}
            personName={values.name}
            photo={values.photo}
          />
          <PersonUserField
            disabled={!canEdit}
            onChange={(userId) => update({ userId })}
            userId={values.userId}
            users={users}
          />
        </BoardFormSection>
        <BoardFormDivider />
        <BoardFormSection>
          <LocalizedTextField
            {...site}
            disabled={!canEdit}
            error={visibleErrors.bio}
            id="person-bio"
            label="Biografía"
            maxLength={PERSON_BIO_MAX_LENGTH}
            multiline={true}
            onChange={(locale, value) => update({ bios: { ...values.bios, [locale]: value } })}
            tabsLabel="Idioma de la biografía"
            values={values.bios}
          />
        </BoardFormSection>
        <BoardFormDivider />
        <BoardFormSection>
          <RoleSection
            {...site}
            disabled={!canEdit}
            hint="Sin cargo, la persona no pertenece al equipo y no aparece en esa sección."
            id="person-team"
            onChange={(team) => update({ team })}
            orderError={visibleErrors.order}
            role={values.team}
            title="Equipo"
            titleError={visibleErrors.teamTitle}
          />
        </BoardFormSection>
        <BoardFormDivider />
        <BoardFormSection>
          <RoleSection
            {...site}
            disabled={!canEdit}
            hint="Sin cargo, la persona no firma artículos del blog. Las estadísticas se muestran en su tarjeta de autor."
            id="person-blog-author"
            onChange={(blogAuthor) => update({ blogAuthor })}
            orderError={visibleErrors.blogAuthorOrder}
            role={values.blogAuthor}
            statsError={visibleErrors.blogAuthorStats}
            title={PERSON_CONTEXT_LABELS["blog-author"]}
            titleError={visibleErrors.blogAuthorTitle}
            withStats={true}
          />
        </BoardFormSection>
      </BoardFormSections>
      <BoardFormFooter>
        {canDelete && person ? (
          <PersonDeleteButton
            disabled={busy}
            onConfirm={() => void remove()}
            personName={person.name}
          />
        ) : null}
        <BoardButton href={getChurchRoutePath("website", "people")} variant="ghost">
          Volver
        </BoardButton>
        {canEdit ? (
          <BoardButton disabled={busy} onClick={() => void submit()} variant="primary">
            {busy ? "Guardando…" : "Guardar"}
          </BoardButton>
        ) : null}
      </BoardFormFooter>
    </BoardFormCard>
  );
}
