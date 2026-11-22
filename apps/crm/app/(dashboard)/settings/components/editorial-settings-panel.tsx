"use client";

import {
  type EditorialContentTypeParam,
  type EditorialSettingsDto,
  PERMISSIONS,
  type RoleDto,
  type UserDto,
} from "@ancla/contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { apiClient } from "@/lib/api/apiClient";
import { describeApiFailure } from "@/lib/api/describeApiFailure";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { cn } from "@/lib/utils";
import { OptionChecklist } from "./option-checklist";

const CONTENT_TYPE_LABELS: Record<EditorialContentTypeParam, string> = {
  "blog-post": "Blog",
  ministry: "Ministerios",
  "simple-page": "Páginas",
  event: "Eventos",
};

const editorialSettingsPanelSettingsPage = {
  panel: cn("flex flex-col gap-5"),
  card: cn("flex flex-col gap-4 p-5"),
  title: cn("font-display text-lg font-medium"),
  description: cn("text-[13.5px] leading-normal text-[var(--tinta-suave)]"),
  grid: cn("grid gap-4 md:grid-cols-2"),
  footer: cn("flex justify-end"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
};

interface EditorialTypeCardProps {
  settings: EditorialSettingsDto;
  roles: RoleDto[] | null;
  users: UserDto[] | null;
}

function EditorialTypeCard({ settings, roles, users }: EditorialTypeCardProps) {
  const router = useRouter();
  const access = useAccess();
  const canEdit = can(access, PERMISSIONS.editorial.edit);
  const [draft, setDraft] = useState(settings);
  const [saving, setSaving] = useState(false);

  const roleOptions = (roles ?? []).map((role) => ({ value: role.id, label: role.name }));
  const userOptions = (users ?? []).map((user) => ({
    value: user.id,
    label: user.name,
    hint: user.email,
  }));
  const set = (key: keyof Omit<EditorialSettingsDto, "contentType">) => (ids: string[]) =>
    setDraft({ ...draft, [key]: ids });

  async function save() {
    const { contentType, ...json } = draft;
    setSaving(true);
    try {
      const response = await apiClient.editorial.settings[":type"].$put({
        param: { type: contentType },
        json,
      });
      if (!response.ok) {
        toast.error(describeApiFailure(response.status, "No se pudo guardar. Recarga la página."));
        return;
      }
      toast.success("Revisión editorial guardada");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <BoardCard className={editorialSettingsPanelSettingsPage.card}>
      <h2 className={editorialSettingsPanelSettingsPage.title}>
        {CONTENT_TYPE_LABELS[settings.contentType]}
      </h2>
      <p className={editorialSettingsPanelSettingsPage.description}>
        Quienes revisan aprueban o piden cambios. Lo que escriben las personas con revisión
        obligatoria nunca se publica sin que alguien más lo apruebe. Si no hay revisores, avisamos a
        quienes administran.
      </p>
      <div className={editorialSettingsPanelSettingsPage.grid}>
        <OptionChecklist
          disabled={!canEdit}
          emptyText="No hay roles."
          legend="Roles revisores"
          onChange={set("reviewerRoleIds")}
          options={roleOptions}
          selected={draft.reviewerRoleIds}
        />
        <OptionChecklist
          disabled={!canEdit}
          emptyText="No hay personas."
          legend="Personas revisoras"
          onChange={set("reviewerUserIds")}
          options={userOptions}
          selected={draft.reviewerUserIds}
        />
        <OptionChecklist
          disabled={!canEdit}
          emptyText="No hay roles."
          legend="Roles con revisión obligatoria"
          onChange={set("mandatoryReviewRoleIds")}
          options={roleOptions}
          selected={draft.mandatoryReviewRoleIds}
        />
        <OptionChecklist
          disabled={!canEdit}
          emptyText="No hay personas."
          legend="Personas con revisión obligatoria"
          onChange={set("mandatoryReviewUserIds")}
          options={userOptions}
          selected={draft.mandatoryReviewUserIds}
        />
      </div>
      {canEdit ? (
        <div className={editorialSettingsPanelSettingsPage.footer}>
          <BoardButton
            aria-label={`Guardar ${CONTENT_TYPE_LABELS[settings.contentType]}`}
            disabled={saving}
            onClick={() => void save()}
            variant="primary"
          >
            Guardar
          </BoardButton>
        </div>
      ) : null}
    </BoardCard>
  );
}

interface EditorialSettingsPanelProps {
  /** `null` when the caller may not see them (the API answered 403). */
  settings: EditorialSettingsDto[] | null;
  roles: RoleDto[] | null;
  users: UserDto[] | null;
}

/** Who reviews, and who must be reviewed, for each type of content that has an editorial flow. */
export function EditorialSettingsPanel({ settings, roles, users }: EditorialSettingsPanelProps) {
  if (settings === null) {
    return (
      <p className={editorialSettingsPanelSettingsPage.empty}>
        Tu rol no permite ver la revisión editorial.
      </p>
    );
  }
  return (
    <div className={editorialSettingsPanelSettingsPage.panel}>
      {settings.map((entry) => (
        <EditorialTypeCard
          // A new key remounts the card with the saved values after a refresh.
          key={`${entry.contentType}:${JSON.stringify(entry)}`}
          roles={roles}
          settings={entry}
          users={users}
        />
      ))}
    </div>
  );
}
