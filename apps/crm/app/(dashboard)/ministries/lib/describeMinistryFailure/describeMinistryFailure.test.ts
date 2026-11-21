import { describe, expect, test } from "bun:test";
import { describeMinistryFailure } from "./describeMinistryFailure";

function problem(status: number, code: string): Response {
  return new Response(JSON.stringify({ code }), { status });
}

describe("describeMinistryFailure", () => {
  test("tells the ministry codes apart", async () => {
    expect(await describeMinistryFailure(problem(409, "stale_version"))).toContain("Recarga");
    expect(await describeMinistryFailure(problem(409, "category_in_use"))).toContain("categoría");
    expect(await describeMinistryFailure(problem(400, "invalid_person"))).toContain("personas");
  });

  test("an unknown code or a body that is not JSON falls back to the status message", async () => {
    expect(await describeMinistryFailure(problem(403, "forbidden"))).toContain("rol");
    expect(await describeMinistryFailure(new Response("nope", { status: 500 }))).toContain(
      "No se pudo",
    );
  });
});
