import { describe, expect, it } from "bun:test";
import {
  getAssemblyReport,
  getAssemblyReportByCode,
  getPublicAccessState,
} from "./assembly-access";

describe("getAssemblyReportByCode", () => {
  it("matches codes case-insensitively", () => {
    expect(getAssemblyReportByCode(" asm-7k4q92 ")?.id).toBe("1");
  });

  it("returns null for unknown codes", () => {
    expect(getAssemblyReportByCode("XXX")).toBeNull();
  });
});

describe("getPublicAccessState", () => {
  it("maps report status to the public view", () => {
    expect(getPublicAccessState(getAssemblyReport("1"))).toBe("visible");
    expect(getPublicAccessState(getAssemblyReport("2"))).toBe("not-yet");
    expect(getPublicAccessState(getAssemblyReport("4"))).toBe("expired");
    expect(getPublicAccessState(getAssemblyReport("5"))).toBe("revoked");
    expect(getPublicAccessState(null)).toBe("invalid");
  });
});
