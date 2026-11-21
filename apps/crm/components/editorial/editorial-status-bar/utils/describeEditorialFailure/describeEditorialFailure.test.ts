import { describe, expect, test } from "bun:test";
import { describeEditorialFailure } from "./describeEditorialFailure";

function problem(status: number, code?: string): Response {
  return new Response(JSON.stringify({ code }), { status });
}

describe("describeEditorialFailure", () => {
  test("a known problem code gets its own message", async () => {
    expect(await describeEditorialFailure(problem(409, "slug_taken"))).toContain("slug");
    expect(await describeEditorialFailure(problem(409, "slug_locked"))).toContain("ya publicado");
    expect(await describeEditorialFailure(problem(400, "invalid_author"))).toContain("autor");
    expect(await describeEditorialFailure(problem(400, "invalid_media"))).toContain("imagen");
  });

  test("without a known code it falls back to the status", async () => {
    expect(await describeEditorialFailure(problem(409))).toContain("Recarga");
    expect(await describeEditorialFailure(problem(403))).toContain("rol");
  });

  test("a body that is not JSON still gets the status message", async () => {
    expect(await describeEditorialFailure(new Response("x", { status: 404 }))).toContain("Recarga");
  });
});
