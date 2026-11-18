import { describe, expect, test } from "bun:test";
import { assemblyReports } from "../data/assembly-reports";
import {
  buildAccessLink,
  describeValidity,
  filterAssemblyReports,
  getLifecycleIndex,
  getPanelMode,
  summarizeAssembly,
} from "./assembly-view";

describe("assembly view helpers", () => {
  test("filters by status group and search", () => {
    expect(filterAssemblyReports(assemblyReports, "scheduled", "")).toHaveLength(2);
    expect(filterAssemblyReports(assemblyReports, "all", "asm-5t7")).toHaveLength(1);
    expect(filterAssemblyReports(assemblyReports, "open", "terreno")).toHaveLength(0);
  });

  test("summarizes accesses and blocked attempts", () => {
    const summary = summarizeAssembly(assemblyReports);
    expect(summary.open).toBe(1);
    expect(summary.scheduled).toBe(2);
    expect(summary.accesses).toBe(209);
    expect(summary.blocked).toBe(9);
  });

  test("derives link, panel mode and lifecycle step", () => {
    expect(buildAccessLink("ASM-7K4Q92")).toBe("iekklesia.app/a/7K4Q92");
    expect(getPanelMode("Programado")).toBe("closed");
    expect(getPanelMode("Dado de baja")).toBe("ended");
    expect(getLifecycleIndex("Abierto")).toBe(2);
  });

  test("describes a validity window", () => {
    expect(describeValidity("2026-11-24T10:30", "2026-11-24T14:00")).toBe("24 nov · 10:30–14:00");
    expect(describeValidity("", "")).toBe("Sin definir");
  });
});
