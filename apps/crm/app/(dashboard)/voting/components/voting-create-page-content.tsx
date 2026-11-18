"use client";

import { CalendarDays, Check, GripVertical, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import {
  BoardFormRow,
  BoardInput,
  BoardSwitchRow,
  BoardTextarea,
  boardFormStyles,
} from "@/components/dashboard/board/board-form";
import { RowIconButton } from "@/components/dashboard/board/row-icon-button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { MajorityType } from "../types";
import { useVotingCollection } from "../use-voting-data";
import { getVotingListPath } from "../voting-routes";
import { VotingMajorityToggle } from "./voting-majority-toggle";

const ENABLED_USERS = 120;
const MIN_OPTIONS = 2;
const MIN_TITLE_LENGTH = 5;
const DEFAULT_QUORUM_PERCENT = 50;

interface OptionDraft {
  id: string;
  value: string;
}

const DEFAULT_OPTIONS = ["A favor", "En contra", "Abstención"];

function createOptionDraft(value: string, index: number): OptionDraft {
  return { id: `option-${Date.now().toString(36)}-${index}`, value };
}

const votingCreatePageContentVotingPage = {
  page: cn("flex flex-col gap-5"),
  description: cn("text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  columns: cn("grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1.4fr_1fr]"),
  stack: cn("flex flex-col gap-[18px]"),
  card: cn("p-6"),
  fields: cn("flex flex-col gap-4"),
  options: cn("flex flex-col gap-2.5"),
  option: cn("flex items-center gap-3 rounded-[20px] bg-secondary px-3.5 py-3"),
  grip: cn("size-4 text-[var(--tinta-apagada)]"),
  optionInput: cn("min-w-0 flex-1 bg-transparent text-sm outline-none"),
  rules: cn("flex flex-col gap-[18px]"),
  rule: cn("flex flex-col gap-2"),
  ruleLabel: cn("text-[13px] text-[var(--tinta-suave)]"),
  slider: cn(
    "[&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-secondary",
    "[&_[data-slot=slider-range]]:bg-[var(--oro)]",
    "[&_[data-slot=slider-thumb]]:size-7 [&_[data-slot=slider-thumb]]:border-0",
    "[&_[data-slot=slider-thumb]]:shadow-[0_4px_10px_rgba(42,21,26,0.3),inset_0_0_0_1px_rgba(42,21,26,0.16)]",
  ),
  sliderRow: cn("flex justify-between text-[12.5px] text-[var(--tinta-apagada)]"),
  sliderValue: cn("font-bold text-foreground"),
  preview: cn("rounded-[30px] bg-(--vino) p-6"),
  previewKicker: cn("text-[11.5px] font-extrabold tracking-[0.12em] text-[#f2e1b6] uppercase"),
  previewTitle: cn("mt-2.5 mb-4 block font-display text-2xl leading-tight font-medium text-white"),
  previewOptions: cn("flex flex-col gap-2"),
  previewOption: cn(
    "rounded-[18px] bg-white/10 px-4 py-[13px] text-sm font-semibold text-white",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]",
  ),
  footer: cn("flex flex-wrap justify-end gap-2.5"),
  icon: cn("size-4"),
  fieldIcon: cn(boardFormStyles.icon),
};

export function VotingCreatePageContent() {
  const router = useRouter();
  const { createVoting } = useVotingCollection();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [opensAt, setOpensAt] = useState("");
  const [options, setOptions] = useState(() =>
    DEFAULT_OPTIONS.map((label, index) => createOptionDraft(label, index)),
  );
  const [majority, setMajority] = useState<MajorityType>("simple");
  const [quorumPercent, setQuorumPercent] = useState(DEFAULT_QUORUM_PERCENT);
  const [anonymous, setAnonymous] = useState(true);
  const [liveResults, setLiveResults] = useState(false);

  const cleanOptions = options.map((option) => option.value.trim()).filter(Boolean);
  const canSubmit = title.trim().length >= MIN_TITLE_LENGTH && cleanOptions.length >= MIN_OPTIONS;
  const quorumCount = Math.round((quorumPercent / 100) * ENABLED_USERS);

  const updateOption = (id: string, value: string) =>
    setOptions((current) =>
      current.map((option) => (option.id === id ? { ...option, value } : option)),
    );

  const removeOption = (id: string) =>
    setOptions((current) =>
      current.length <= MIN_OPTIONS ? current : current.filter((option) => option.id !== id),
    );

  const submit = () => {
    if (!canSubmit) {
      return;
    }
    createVoting({
      title,
      description,
      type: cleanOptions.length === 2 ? "binary" : "motion",
      options: cleanOptions,
      quorum: quorumCount,
      majorityType: majority,
      anonymous,
      liveResults,
    });
    router.push(getVotingListPath());
  };

  return (
    <div className={votingCreatePageContentVotingPage.page}>
      <p className={votingCreatePageContentVotingPage.description}>
        Define la pregunta, las opciones y las reglas antes de abrir la sesión.
      </p>

      <div className={votingCreatePageContentVotingPage.columns}>
        <div className={votingCreatePageContentVotingPage.stack}>
          <BoardCard className={votingCreatePageContentVotingPage.card}>
            <BoardCardHeader subtitle="Qué se decide y cuándo" title="Datos de la votación" />
            <div className={votingCreatePageContentVotingPage.fields}>
              <BoardInput
                id="voting-title"
                label="Título"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej. Aprobación del presupuesto 2027"
                value={title}
              />
              <BoardTextarea
                id="voting-description"
                label="Descripción"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Qué se vota y por qué"
                value={description}
              />
              <BoardFormRow>
                <BoardInput
                  icon={
                    <CalendarDays
                      aria-hidden="true"
                      className={votingCreatePageContentVotingPage.fieldIcon}
                    />
                  }
                  id="voting-opens"
                  label="Fecha de apertura"
                  onChange={(event) => setOpensAt(event.target.value)}
                  type="datetime-local"
                  value={opensAt}
                />
                <BoardInput
                  id="voting-close"
                  label="Cierre automático"
                  readOnly={true}
                  value="Al terminar la sesión"
                />
              </BoardFormRow>
            </div>
          </BoardCard>

          <BoardCard className={votingCreatePageContentVotingPage.card}>
            <BoardCardHeader
              action={
                <BoardButton
                  onClick={() =>
                    setOptions((current) => [
                      ...current,
                      createOptionDraft(`Opción ${current.length + 1}`, current.length),
                    ])
                  }
                  size="sm"
                  variant="soft"
                >
                  <Plus aria-hidden="true" className={votingCreatePageContentVotingPage.icon} />
                  Agregar
                </BoardButton>
              }
              subtitle="Lo que las personas podrán elegir"
              title="Opciones"
            />
            <div className={votingCreatePageContentVotingPage.options}>
              {options.map((option, index) => (
                <div className={votingCreatePageContentVotingPage.option} key={option.id}>
                  <GripVertical
                    aria-hidden="true"
                    className={votingCreatePageContentVotingPage.grip}
                  />
                  <input
                    aria-label={`Opción ${index + 1}`}
                    className={votingCreatePageContentVotingPage.optionInput}
                    onChange={(event) => updateOption(option.id, event.target.value)}
                    value={option.value}
                  />
                  <RowIconButton
                    label={`Quitar opción ${index + 1}`}
                    onClick={() => removeOption(option.id)}
                  >
                    <Trash2 aria-hidden="true" className={votingCreatePageContentVotingPage.icon} />
                  </RowIconButton>
                </div>
              ))}
            </div>
          </BoardCard>
        </div>

        <div className={votingCreatePageContentVotingPage.stack}>
          <BoardCard className={votingCreatePageContentVotingPage.card}>
            <BoardCardHeader subtitle="Cómo se valida el resultado" title="Reglas" />
            <div className={votingCreatePageContentVotingPage.rules}>
              <div className={votingCreatePageContentVotingPage.rule}>
                <b className={votingCreatePageContentVotingPage.ruleLabel}>Mayoría requerida</b>
                <VotingMajorityToggle onValueChange={setMajority} value={majority} />
              </div>
              <div className={votingCreatePageContentVotingPage.rule}>
                <b className={votingCreatePageContentVotingPage.ruleLabel}>Quórum requerido</b>
                <Slider
                  aria-label="Quórum requerido"
                  className={votingCreatePageContentVotingPage.slider}
                  max={100}
                  onValueChange={([value]) => setQuorumPercent(value ?? DEFAULT_QUORUM_PERCENT)}
                  step={5}
                  value={[quorumPercent]}
                />
                <div className={votingCreatePageContentVotingPage.sliderRow}>
                  <span>0 %</span>
                  <b className={votingCreatePageContentVotingPage.sliderValue}>
                    {quorumPercent} % de los habilitados ({quorumCount} de {ENABLED_USERS})
                  </b>
                </div>
              </div>
              <BoardSwitchRow
                checked={anonymous}
                hint="Nadie verá qué eligió cada persona."
                onCheckedChange={setAnonymous}
                title="Voto anónimo"
              />
              <BoardSwitchRow
                checked={liveResults}
                hint="Si está apagado, se ven al cerrar."
                onCheckedChange={setLiveResults}
                title="Mostrar resultados en vivo"
              />
            </div>
          </BoardCard>

          <section className={votingCreatePageContentVotingPage.preview}>
            <span className={votingCreatePageContentVotingPage.previewKicker}>
              Así lo verá la gente
            </span>
            <b className={votingCreatePageContentVotingPage.previewTitle}>
              {title.trim() || "Título de la votación"}
            </b>
            <div className={votingCreatePageContentVotingPage.previewOptions}>
              {cleanOptions.map((label) => (
                <span className={votingCreatePageContentVotingPage.previewOption} key={label}>
                  {label}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className={votingCreatePageContentVotingPage.footer}>
        <BoardButton href={getVotingListPath()} variant="ghost">
          Cancelar
        </BoardButton>
        <BoardButton disabled={!canSubmit} onClick={submit} variant="outline">
          Guardar borrador
        </BoardButton>
        <BoardButton disabled={!canSubmit} onClick={submit} variant="primary">
          <Check aria-hidden="true" className={votingCreatePageContentVotingPage.icon} />
          Crear votación
        </BoardButton>
      </div>
    </div>
  );
}
