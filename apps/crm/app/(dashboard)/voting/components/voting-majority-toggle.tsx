"use client";

import { cn } from "@/lib/utils";
import type { MajorityType } from "../types";

interface MajorityChoice {
  value: Extract<MajorityType, "simple" | "qualified">;
  label: string;
}

const MAJORITY_CHOICES: MajorityChoice[] = [
  { value: "simple", label: "Simple" },
  { value: "qualified", label: "Calificada (⅔)" },
];

const votingMajorityToggleVotingPage = {
  group: cn(
    "flex gap-1 rounded-full bg-secondary p-1 shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)]",
  ),
  option: cn(
    "flex-1 rounded-full py-[9px] text-center text-[13px] font-bold text-[var(--tinta-apagada)]",
  ),
  optionActive: cn("bg-card text-foreground shadow-(--sombra)"),
};

interface VotingMajorityToggleProps {
  value: MajorityType;
  onValueChange: (value: MajorityChoice["value"]) => void;
}

/** Two-way switch between simple and qualified majority, as the "Reglas" card draws it. */
export function VotingMajorityToggle({ value, onValueChange }: VotingMajorityToggleProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would bring its own borders and legend.
    <div
      aria-label="Mayoría requerida"
      className={votingMajorityToggleVotingPage.group}
      role="group"
    >
      {MAJORITY_CHOICES.map((choice) => (
        <button
          aria-pressed={choice.value === value}
          className={cn(
            votingMajorityToggleVotingPage.option,
            choice.value === value && votingMajorityToggleVotingPage.optionActive,
          )}
          key={choice.value}
          onClick={() => onValueChange(choice.value)}
          type="button"
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
