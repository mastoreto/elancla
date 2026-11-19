import { describe, expect, test } from "bun:test";
import { runSteps } from "./runSteps";

function capture() {
  const chunks: string[] = [];
  return {
    write: (text: string) => chunks.push(text),
    text: () => chunks.join(""),
  };
}

describe("runSteps (plain output)", () => {
  test("runs every step in order and returns 0", async () => {
    const out = capture();
    const code = await runSteps({
      title: "pre-test",
      interactive: false,
      write: out.write,
      steps: [
        { label: "First", command: ["true"] },
        { label: "Second", command: ["true"] },
      ],
    });
    expect(code).toBe(0);
    const text = out.text();
    expect(text).toContain("2 pasos");
    expect(text).toContain("✔ First");
    expect(text.indexOf("First")).toBeLessThan(text.indexOf("Second"));
    expect(text).not.toContain("✖");
  });

  test("stops at the first failure, shows its output and skips the rest", async () => {
    const out = capture();
    const code = await runSteps({
      title: "pre-test",
      interactive: false,
      write: out.write,
      helpLines: ["HELP-LINE"],
      steps: [
        { label: "Fine", command: ["true"] },
        { label: "Broken", command: ["sh", "-c", "echo boom-output; exit 3"] },
        { label: "Never", command: ["sh", "-c", "echo should-not-run"] },
      ],
    });
    const text = out.text();
    expect(code).toBe(3);
    expect(text).toContain("✖ Broken");
    expect(text).toContain("boom-output");
    expect(text).toContain("HELP-LINE");
    expect(text).toContain("Never");
    expect(text).toContain("(omitido)");
    expect(text).not.toContain("should-not-run");
  });

  test("a command that does not exist fails the step instead of throwing", async () => {
    const out = capture();
    const code = await runSteps({
      title: "pre-test",
      interactive: false,
      write: out.write,
      steps: [{ label: "Ghost", command: ["definitely-not-a-command-xyz"] }],
    });
    expect(code).not.toBe(0);
    expect(out.text()).toContain("✖ Ghost");
  });

  test("passes step env to the command", async () => {
    const out = capture();
    const code = await runSteps({
      title: "pre-test",
      interactive: false,
      write: out.write,
      steps: [
        {
          label: "Env",
          command: ["sh", "-c", '[ "$HOOK_PROBE" = yes ]'],
          env: { HOOK_PROBE: "yes" },
        },
      ],
    });
    expect(code).toBe(0);
  });
});
