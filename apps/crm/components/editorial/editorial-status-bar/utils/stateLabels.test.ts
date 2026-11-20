import { describe, expect, test } from "bun:test";
import { EDITORIAL_ACTIONS, EDITORIAL_STATES } from "@ancla/contracts";
import { actionLabel, stateLabel, stateTone } from "./stateLabels";

describe("editorial labels", () => {
  test("every state has a Spanish label and a tone", () => {
    for (const state of EDITORIAL_STATES) {
      expect(stateLabel(state).length).toBeGreaterThan(0);
      expect(stateTone(state)).toBeDefined();
    }
    expect(stateLabel("in_review")).toBe("En revisión");
    expect(stateTone("published")).toBe("green");
  });

  test("every action has a label", () => {
    for (const action of EDITORIAL_ACTIONS) {
      expect(actionLabel(action).length).toBeGreaterThan(0);
    }
    expect(actionLabel("requestChanges")).toBe("Pedir cambios");
  });
});
