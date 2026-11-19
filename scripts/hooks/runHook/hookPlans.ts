import type { RunStepsOptions } from "../runSteps";

export type StepHook = "pre-commit" | "pre-push";

const EMERGENCY_HELP =
  "Escape de emergencia (solo si sabés lo que hacés): HUSKY=0 git <comando> (el CI lo vuelve a revisar).";

export const HOOK_PLANS: Record<
  StepHook,
  Omit<RunStepsOptions, "interactive" | "write">
> = {
  "pre-commit": {
    title: "pre-commit",
    steps: [
      {
        label: "Biome (archivos staged)",
        command: [
          "bunx",
          "biome",
          "check",
          "--staged",
          "--no-errors-on-unmatched",
        ],
      },
      { label: "Tipos (check-types)", command: ["bun", "run", "check-types"] },
    ],
    helpLines: [
      "Corregí el formato y el lint con `bun run check` y volvé a hacer `git add`.",
      EMERGENCY_HELP,
    ],
  },
  "pre-push": {
    title: "pre-push",
    steps: [
      {
        label: "Infra de test (db-test, mailpit, s3)",
        command: ["bun", "run", "test:infra"],
      },
      {
        label: "Migraciones y seed de db-test",
        command: ["bun", "run", "test:db"],
      },
      {
        label: "Tests (api, db, contracts, crm)",
        command: ["bun", "run", "test"],
      },
      {
        label: "Tests de scripts (hooks, release)",
        command: ["bun", "test", "scripts"],
      },
      {
        label: "Build del CRM",
        command: [
          "bun",
          "--env-file=.env.test",
          "run",
          "--filter",
          "crm",
          "build",
        ],
      },
    ],
    helpLines: [EMERGENCY_HELP],
  },
};
