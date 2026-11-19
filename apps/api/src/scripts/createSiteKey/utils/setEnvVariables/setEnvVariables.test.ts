import { describe, expect, test } from "bun:test";
import { setEnvVariables } from "./setEnvVariables";

describe("setEnvVariables", () => {
  test("appends missing variables and keeps every other line", () => {
    const result = setEnvVariables("# note\nFOO=1\n\nBAR=2\n", {
      API_URL: "http://localhost:3000",
    });
    expect(result).toBe(
      "# note\nFOO=1\n\nBAR=2\nAPI_URL=http://localhost:3000\n",
    );
  });

  test("replaces an existing line in place, even if empty or exported", () => {
    const result = setEnvVariables(
      "A=1\nSITE_API_KEY=\nexport API_URL=old\nB=2\n",
      { SITE_API_KEY: "sk_new", API_URL: "http://new" },
    );
    expect(result).toBe("A=1\nSITE_API_KEY=sk_new\nAPI_URL=http://new\nB=2\n");
  });

  test("does not match a variable that only shares a prefix or sits in a comment", () => {
    const result = setEnvVariables("# API_URL=x\nAPI_URL_OTHER=y\n", {
      API_URL: "z",
    });
    expect(result).toBe("# API_URL=x\nAPI_URL_OTHER=y\nAPI_URL=z\n");
  });

  test("handles an empty file and a file without trailing newline", () => {
    expect(setEnvVariables("", { A: "1" })).toBe("A=1\n");
    expect(setEnvVariables("X=1", { A: "1" })).toBe("X=1\nA=1\n");
  });

  test("is idempotent", () => {
    const once = setEnvVariables("X=1\n", { A: "1", B: "2" });
    expect(setEnvVariables(once, { A: "1", B: "2" })).toBe(once);
  });
});
