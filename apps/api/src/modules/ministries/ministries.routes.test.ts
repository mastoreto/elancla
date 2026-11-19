import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { grant, PERMISSIONS } from "@ancla/contracts";
import { createApiCaller } from "../../../test/support/apiCaller";
import { createFixtures } from "../../../test/support/fixtures";
import { getAuth } from "../../core/auth";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

let ministryA = "";
let ministryB = "";
let leaderCookie = "";
let allScopeCookie = "";

afterAll(() => fixtures.cleanup());

beforeAll(async () => {
  const auth = getAuth();
  ministryA = await fixtures.createMinistry("a");
  ministryB = await fixtures.createMinistry("b");
  leaderCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(
      auth,
      "leader-a",
      [grant(PERMISSIONS.ministryProfile.view, "ministry")],
      { ministryIds: [ministryA] },
    ),
  );
  allScopeCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "all-ministries", [
      grant(PERMISSIONS.ministryProfile.view, "all"),
    ]),
  );
});

async function visibleMinistryIds(cookie: string): Promise<string[]> {
  const res = await call("GET", "/ministries?limit=100", { cookie });
  expect(res.status).toBe(200);
  const page = (await res.json()) as { items: { id: string }[] };
  return page.items.map((item) => item.id);
}

describe("GET /api/ministries scope", () => {
  test("the ministry scope shows only the user's ministries", async () => {
    const ids = await visibleMinistryIds(leaderCookie);
    expect(ids).toContain(ministryA);
    expect(ids).not.toContain(ministryB);
  });

  test("the all scope shows every ministry", async () => {
    const ids = await visibleMinistryIds(allScopeCookie);
    expect(ids).toContain(ministryA);
    expect(ids).toContain(ministryB);
  });

  test("a ministry-scoped user without ministries sees none", async () => {
    const auth = getAuth();
    const cookie = await fixtures.signIn(
      auth,
      await fixtures.passwordUser(auth, "leader-none", [
        grant(PERMISSIONS.ministryProfile.view, "ministry"),
      ]),
    );
    expect(await visibleMinistryIds(cookie)).toEqual([]);
  });
});
