// Entry point of the Husky hooks: bun scripts/hooks/runHook/runHook.ts <hook> [args]
// Each hook is a thin line in .husky/ that lands here.
import { readFileSync } from "node:fs";
import { runSteps } from "../runSteps";
import { validateCommitMessage } from "../validateCommitMessage";
import { HOOK_PLANS, type StepHook } from "./hookPlans";

const COMMIT_MSG_EXAMPLE = "feat(crm): add the audit filters";
const FAILURE_CODE = 1;
const DOCKER_HELP =
  "Docker no responde: levantá Docker Desktop / el daemon y reintentá el push.";

function isStepHook(hook: string | undefined): hook is StepHook {
  return hook === "pre-commit" || hook === "pre-push";
}

function dockerResponds(): boolean {
  try {
    return (
      Bun.spawnSync(["docker", "info"], { stdout: "ignore", stderr: "ignore" })
        .exitCode === 0
    );
  } catch {
    return false;
  }
}

function runCommitMsg(messageFile: string | undefined): number {
  if (!messageFile) {
    console.error("commit-msg: falta la ruta del archivo del mensaje.");
    return FAILURE_CODE;
  }
  const { valid, errors } = validateCommitMessage(
    readFileSync(messageFile, "utf8"),
  );
  if (valid) return 0;
  console.error("✖ Mensaje de commit rechazado:");
  for (const error of errors) console.error(`  - ${error}`);
  console.error(`\nEjemplo válido: ${COMMIT_MSG_EXAMPLE}`);
  return FAILURE_CODE;
}

async function main(): Promise<number> {
  const [hook, ...args] = Bun.argv.slice(2);
  if (hook === "commit-msg") return runCommitMsg(args[0]);
  if (!isStepHook(hook)) {
    console.error(`Hook desconocido: ${hook ?? "(ninguno)"}`);
    return FAILURE_CODE;
  }
  if (hook === "pre-push" && !dockerResponds()) {
    console.error(DOCKER_HELP);
    return FAILURE_CODE;
  }
  return runSteps(HOOK_PLANS[hook]);
}

process.exit(await main());
