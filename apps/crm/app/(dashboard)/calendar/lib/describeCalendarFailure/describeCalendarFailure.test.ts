import { describe, expect, test } from "bun:test";
import { describeCalendarFailure } from "./describeCalendarFailure";

function problem(status: number, code: string): Response {
  return new Response(JSON.stringify({ code }), { status });
}

describe("describeCalendarFailure", () => {
  test("tells the calendar codes apart", async () => {
    expect(await describeCalendarFailure(problem(409, "year_exists"))).toContain("ya existe");
    expect(await describeCalendarFailure(problem(409, "stale_version"))).toContain("Recarga");
    expect(await describeCalendarFailure(problem(400, "invalid_role"))).toContain("roles");
  });

  test("tells the schedule, place and copy codes apart", async () => {
    expect(await describeCalendarFailure(problem(409, "place_in_use"))).toContain("muévelo");
    expect(await describeCalendarFailure(problem(409, "schedule_set_in_use"))).toContain(
      "excepción",
    );
    expect(await describeCalendarFailure(problem(409, "exception_date_taken"))).toContain("fecha");
    expect(await describeCalendarFailure(problem(409, "year_not_draft"))).toContain("borrador");
    expect(await describeCalendarFailure(problem(400, "not_reviewable"))).toContain("fijas");
  });

  test("reuses the editorial messages for their codes", async () => {
    expect(await describeCalendarFailure(problem(409, "year_not_published"))).toContain("borrador");
  });

  test("an unknown code or a body that is not JSON falls back to the status message", async () => {
    expect(await describeCalendarFailure(problem(403, "forbidden"))).toContain("rol");
    expect(await describeCalendarFailure(new Response("nope", { status: 500 }))).toContain(
      "No se pudo",
    );
  });
});
