import { describe, expect, test } from "bun:test";
import { describeTaxonomyFailure } from "./describeTaxonomyFailure";

function problem(status: number, code: string): Response {
  return new Response(JSON.stringify({ code }), { status });
}

describe("describeTaxonomyFailure", () => {
  test("tells the 409 codes apart", async () => {
    expect(await describeTaxonomyFailure(problem(409, "stale_version"))).toContain("Recarga");
    expect(await describeTaxonomyFailure(problem(409, "slug_taken"))).toContain("slug");
    expect(await describeTaxonomyFailure(problem(409, "category_in_use"))).toContain("categoría");
  });

  test("an unknown code or a body that is not JSON falls back to the status message", async () => {
    expect(await describeTaxonomyFailure(problem(403, "forbidden"))).toContain("rol");
    expect(await describeTaxonomyFailure(new Response("nope", { status: 500 }))).toContain(
      "No se pudo",
    );
  });
});
