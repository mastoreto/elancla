import { formatDuration } from "./formatDuration";
import type { RunStepsOptions, Step } from "./types";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const SPINNER_INTERVAL_MS = 80;
const FAILURE_TAIL_LINES = 60;
const SIGINT_EXIT_CODE = 130;
const GENERIC_FAILURE_CODE = 1;
const LABEL_GAP = 2;

const ANSI = {
  green: "\u001b[32m",
  red: "\u001b[31m",
  dim: "\u001b[2m",
  bold: "\u001b[1m",
  reset: "\u001b[0m",
  clearLine: "\u001b[2K",
  hideCursor: "\u001b[?25l",
  showCursor: "\u001b[?25h",
};

type Status = "pending" | "running" | "done" | "failed";

interface StepState {
  step: Step;
  status: Status;
  startedAt: number;
  durationMs: number;
}

interface StepResult {
  exitCode: number;
  output: string;
}

async function collect(
  stream: ReadableStream<Uint8Array>,
  sink: string[],
): Promise<void> {
  const decoder = new TextDecoder();
  for await (const chunk of stream)
    sink.push(decoder.decode(chunk, { stream: true }));
}

/** Runs one command capturing stdout and stderr together, in arrival order. */
async function runCommand(
  step: Step,
  onSpawn: (kill: () => void) => void,
): Promise<StepResult> {
  const output: string[] = [];
  try {
    const child = Bun.spawn(step.command, {
      env: { ...Bun.env, ...step.env },
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
    });
    onSpawn(() => child.kill());
    await Promise.all([
      collect(child.stdout, output),
      collect(child.stderr, output),
    ]);
    return { exitCode: await child.exited, output: output.join("") };
  } catch (error) {
    return {
      exitCode: GENERIC_FAILURE_CODE,
      output: error instanceof Error ? error.message : String(error),
    };
  }
}

function lastLines(text: string, count: number): string {
  return text.trimEnd().split("\n").slice(-count).join("\n");
}

/**
 * Runs the steps in order and draws a console panel (spinner, live timer, check/cross with the
 * duration). The first failure prints the tail of that step's output, skips the rest and returns
 * its exit code. Without a TTY, or with NO_COLOR, it prints plain lines.
 * Returns the exit code instead of exiting so callers (and tests) decide what to do with it.
 */
export async function runSteps({
  title,
  steps,
  helpLines = [],
  interactive = Boolean(process.stdout.isTTY) && !Bun.env.NO_COLOR,
  write = (text) => process.stdout.write(text),
}: RunStepsOptions): Promise<number> {
  const states: StepState[] = steps.map((step) => ({
    step,
    status: "pending",
    startedAt: 0,
    durationMs: 0,
  }));
  const labelWidth =
    Math.max(0, ...steps.map((step) => step.label.length)) + LABEL_GAP;
  const color = (code: string, text: string) =>
    interactive ? `${code}${text}${ANSI.reset}` : text;
  const header = `${color(ANSI.bold, "⚓")} ${title} · ${steps.length} ${steps.length === 1 ? "paso" : "pasos"}`;

  let frame = 0;
  let drawnLines = 0;
  let killCurrent: (() => void) | undefined;

  function line(state: StepState): string {
    const label = state.step.label.padEnd(labelWidth);
    switch (state.status) {
      case "done":
        return `  ${color(ANSI.green, "✔")} ${label}${formatDuration(state.durationMs)}`;
      case "failed":
        return `  ${color(ANSI.red, "✖")} ${label}${formatDuration(state.durationMs)}`;
      case "running":
        return `  ${SPINNER_FRAMES[frame % SPINNER_FRAMES.length]} ${label}${formatDuration(Date.now() - state.startedAt)}…`;
      default:
        return `  ${color(ANSI.dim, "○")} ${color(ANSI.dim, state.step.label)}`;
    }
  }

  function draw(): void {
    const lines = [header, ...states.map(line)];
    const rewind = drawnLines > 0 ? `\u001b[${drawnLines}A` : "";
    write(rewind + lines.map((text) => `${ANSI.clearLine}${text}\n`).join(""));
    drawnLines = lines.length;
  }

  function onInterrupt(): void {
    killCurrent?.();
    if (interactive) write(ANSI.showCursor);
    write("\nInterrumpido.\n");
    process.exit(SIGINT_EXIT_CODE);
  }

  process.on("SIGINT", onInterrupt);
  if (interactive) write(ANSI.hideCursor);
  else write(`${header}\n`);
  const timer = interactive
    ? setInterval(() => {
        frame += 1;
        draw();
      }, SPINNER_INTERVAL_MS)
    : undefined;
  if (interactive) draw();

  let failure: { state: StepState; result: StepResult } | undefined;
  for (const state of states) {
    if (failure) break;
    state.status = "running";
    state.startedAt = Date.now();
    if (interactive) draw();
    else write(`  … ${state.step.label}\n`);

    const result = await runCommand(state.step, (kill) => {
      killCurrent = kill;
    });
    state.durationMs = Date.now() - state.startedAt;
    state.status = result.exitCode === 0 ? "done" : "failed";
    if (result.exitCode !== 0) failure = { state, result };
    if (interactive) draw();
    else write(`${line(state)}\n`);
  }

  if (timer) clearInterval(timer);
  process.off("SIGINT", onInterrupt);
  if (interactive) write(ANSI.showCursor);
  if (!interactive) {
    for (const state of states.filter(({ status }) => status === "pending")) {
      write(`${line(state)} (omitido)\n`);
    }
  }
  if (!failure) return 0;

  write(`\n${color(ANSI.red, `✖ Falló: ${failure.state.step.label}`)}\n`);
  write(`${lastLines(failure.result.output, FAILURE_TAIL_LINES)}\n`);
  for (const help of helpLines) write(`${help}\n`);
  return failure.result.exitCode || GENERIC_FAILURE_CODE;
}
