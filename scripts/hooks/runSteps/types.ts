export interface Step {
  label: string;
  /** Program and arguments, run without a shell. */
  command: string[];
  env?: Record<string, string>;
}

export interface RunStepsOptions {
  title: string;
  steps: readonly Step[];
  /** Printed after a failure, e.g. how to fix or the emergency escape hatch. */
  helpLines?: readonly string[];
  /** Spinner and colors; defaults to a TTY without NO_COLOR. */
  interactive?: boolean;
  write?: (text: string) => void;
}
