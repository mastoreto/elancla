import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  AUDIT_ACTIONS,
  grant,
  PERMISSIONS,
  type PersonProfileDto,
  type PersonProfileListDto,
  personProfileDto,
  publicPersonDto,
  type UpsertPersonProfileBody,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { auditRowsOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import { getAuth } from "../../core/auth";
import { resolveOrganizationId } from "../../core/tenancy";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const NAME_PREFIX = "Zz People Test";
const DISABLED_LOCALE = "fr";
const SEEDED_TEAM_SIZE = 6;
const FORBIDDEN_PUBLIC_KEYS = [
  "id",
  "userId",
  "organizationId",
  "personProfileId",
  "createdAt",
  "updatedAt",
];

let organizationId = "";
let slug = "";
let siteKey = "";
let editorCookie = "";
let viewerCookie = "";
let strangerUserId = "";
let readyPhotoId = "";
let pendingPhotoId = "";
let foreignPhotoId = "";
let otherChurchKey = "";
let otherChurchSlug = "";
const createdIds: string[] = [];
const mediaIds: string[] = [];

/** A fresh member per call: a user can be linked to a single profile. */
async function newMemberId(): Promise<string> {
  const email = await fixtures.passwordUser(getAuth(), "people-member", [
    grant(PERMISSIONS.people.view),
  ]);
  return (await db.user.findUniqueOrThrow({ where: { email } })).id;
}

async function createMedia(
  orgId: string,
  status: "ready" | "pending",
  purpose: "contentImage" | "voucherDocument" = "contentImage",
): Promise<string> {
  const id = crypto.randomUUID();
  const row = await db.mediaFile.create({
    data: {
      id,
      organizationId: orgId,
      purpose,
      status,
      key: `${orgId}/${id}`,
      contentType: "image/png",
      size: 10,
      originalName: "photo.png",
      variants: [
        {
          width: 400,
          height: 300,
          format: "webp",
          key: `${orgId}/${id}/400.webp`,
          size: 1,
        },
        {
          width: 400,
          height: 300,
          format: "avif",
          key: `${orgId}/${id}/400.avif`,
          size: 1,
        },
        {
          width: 800,
          height: 600,
          format: "webp",
          key: `${orgId}/${id}/800.webp`,
          size: 1,
        },
      ],
    },
  });
  mediaIds.push(row.id);
  return row.id;
}

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  const organization = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { slug: true },
  });
  slug = organization.slug;
  siteKey = (await fixtures.createSiteKey(organizationId)).key;
  const other = await fixtures.createOrganization("people-other-church");
  otherChurchSlug = other.slug;
  otherChurchKey = (await fixtures.createSiteKey(other.id)).key;

  const auth = getAuth();
  editorCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "people-editor", [
      grant(PERMISSIONS.people.view),
      grant(PERMISSIONS.people.create),
      grant(PERMISSIONS.people.edit),
      grant(PERMISSIONS.people.delete),
    ]),
  );
  viewerCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "people-viewer", [
      grant(PERMISSIONS.people.view),
    ]),
  );
  // No role at all: this user is not a member of the organization.
  const strangerEmail = await fixtures.passwordUser(auth, "people-stranger");
  strangerUserId = (
    await db.user.findUniqueOrThrow({ where: { email: strangerEmail } })
  ).id;

  readyPhotoId = await createMedia(organizationId, "ready");
  pendingPhotoId = await createMedia(organizationId, "pending");
  foreignPhotoId = await createMedia(other.id, "ready");
});

afterAll(async () => {
  await db.personProfile.deleteMany({
    where: {
      OR: [{ id: { in: createdIds } }, { name: { startsWith: NAME_PREFIX } }],
    },
  });
  await db.mediaFile.deleteMany({ where: { id: { in: mediaIds } } });
  await fixtures.cleanup();
});

type Role = UpsertPersonProfileBody["roles"][number];

const role = (overrides: Partial<Role> = {}): Role => ({
  context: "team",
  visible: true,
  order: 0,
  translations: { es: { title: "Pastor" }, en: { title: "Pastor" } },
  ...overrides,
});

function bodyOf(
  overrides: Partial<UpsertPersonProfileBody> = {},
): UpsertPersonProfileBody {
  return {
    name: `${NAME_PREFIX} Ana`,
    photoId: null,
    userId: null,
    translations: { es: { bio: "Bio en español" } },
    roles: [role()],
    ...overrides,
  };
}

async function create(
  overrides: Partial<UpsertPersonProfileBody> = {},
  cookie = editorCookie,
): Promise<Response> {
  const res = await call("POST", "/content/people", {
    cookie,
    body: bodyOf(overrides),
  });
  if (res.status === 201) {
    createdIds.push(((await res.clone().json()) as PersonProfileDto).id);
  }
  return res;
}

async function createOk(
  overrides: Partial<UpsertPersonProfileBody> = {},
): Promise<PersonProfileDto> {
  const res = await create(overrides);
  expect(res.status).toBe(201);
  return (await res.json()) as PersonProfileDto;
}

function getPublic(
  context: string | null,
  query = "",
  key = siteKey,
  church = slug,
): Promise<Response> {
  const params = context === null ? query : `?context=${context}${query}`;
  return call("GET", `/public/v1/${church}/people${params}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
}

async function publicPeople(
  context: string,
  query = "",
): Promise<Record<string, unknown>[]> {
  const res = await getPublic(context, query);
  expect(res.status).toBe(200);
  return (await res.json()) as Record<string, unknown>[];
}

describe("POST /content/people", () => {
  test("creates a profile, returns the admin DTO and audits it", async () => {
    const memberUserId = await newMemberId();
    const created = await createOk({
      photoId: readyPhotoId,
      userId: memberUserId,
      roles: [role(), role({ context: "preacher", order: 2 })],
    });
    expect(() => personProfileDto.parse(created)).not.toThrow();
    expect(created.photo?.id).toBe(readyPhotoId);
    expect(created.userId).toBe(memberUserId);
    expect(created.roles.map((r) => r.context)).toEqual(["team", "preacher"]);
    expect(created.translations.es?.bio).toBe("Bio en español");

    const [row] = await auditRowsOf({
      entityId: created.id,
      action: AUDIT_ACTIONS.personProfile.created,
    });
    expect(row?.before).toBeNull();
    expect(row?.after).toMatchObject({ id: created.id, name: created.name });
  });

  test("saves the stats of a role title and returns them", async () => {
    const stats = [{ label: "Años de ministerio", value: "20" }];
    const created = await createOk({
      roles: [
        role({
          context: "blog-author",
          translations: { es: { title: "Autor", stats } },
        }),
      ],
    });
    expect(created.roles[0]?.translations.es?.stats).toEqual(stats);
    const stored = await db.personRoleTranslation.findFirst({
      where: { personRole: { personProfileId: created.id }, locale: "es" },
    });
    expect(stored?.stats).toEqual(stats);
  });

  test("more than four stats is a 400", async () => {
    const stat = { label: "L", value: "1" };
    const res = await create({
      roles: [
        role({
          translations: { es: { title: "Pastor", stats: Array(5).fill(stat) } },
        }),
      ],
    });
    expect(res.status).toBe(400);
  });

  test("a repeated context is a 400", async () => {
    const res = await create({ roles: [role(), role()] });
    expect(res.status).toBe(400);
  });

  test("a language the organization does not use is a 400, in bios and in titles", async () => {
    expect(
      (await create({ translations: { [DISABLED_LOCALE]: { bio: "x" } } }))
        .status,
    ).toBe(400);
    expect(
      (
        await create({
          roles: [
            role({ translations: { [DISABLED_LOCALE]: { title: "x" } } }),
          ],
        })
      ).status,
    ).toBe(400);
  });

  test("a photo of another organization, a pending one, a private one or an unknown one is a 400", async () => {
    const voucher = await createMedia(
      organizationId,
      "ready",
      "voucherDocument",
    );
    for (const photoId of [
      foreignPhotoId,
      pendingPhotoId,
      voucher,
      crypto.randomUUID(),
    ]) {
      expect((await create({ photoId })).status).toBe(400);
    }
  });

  test("a user who is not a member of the organization is a 400", async () => {
    expect((await create({ userId: strangerUserId })).status).toBe(400);
    expect((await create({ userId: crypto.randomUUID() })).status).toBe(400);
  });

  test("linking a user who already has a profile is a 409 problem", async () => {
    const memberUserId = await newMemberId();
    await createOk({ userId: memberUserId });
    const res = await create({
      name: `${NAME_PREFIX} Dup`,
      userId: memberUserId,
    });
    expect(res.status).toBe(409);
    const problem = (await res.json()) as { code?: string };
    expect(problem.code).toBeDefined();
  });

  test("people:view cannot create", async () => {
    expect((await create({}, viewerCookie)).status).toBe(403);
  });
});

describe("GET /content/people", () => {
  test("lists by name with the seeded team and viewers can read", async () => {
    await createOk({ name: `${NAME_PREFIX} Beta` });
    await createOk({ name: `${NAME_PREFIX} Alfa` });
    const res = await call("GET", "/content/people", { cookie: viewerCookie });
    expect(res.status).toBe(200);
    const { data } = (await res.json()) as PersonProfileListDto;
    const names = data.map((person) => person.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
    expect(names.indexOf(`${NAME_PREFIX} Alfa`)).toBeLessThan(
      names.indexOf(`${NAME_PREFIX} Beta`),
    );
    expect(data.length).toBeGreaterThanOrEqual(SEEDED_TEAM_SIZE);
  });
});

describe("GET /content/people/:id", () => {
  test("returns one profile; an unknown id is a 404", async () => {
    const created = await createOk();
    const res = await call("GET", `/content/people/${created.id}`, {
      cookie: viewerCookie,
    });
    expect(res.status).toBe(200);
    expect(((await res.json()) as PersonProfileDto).id).toBe(created.id);
    const missing = await call(
      "GET",
      `/content/people/${crypto.randomUUID()}`,
      {
        cookie: viewerCookie,
      },
    );
    expect(missing.status).toBe(404);
  });

  test("a profile of another organization is a 404", async () => {
    const other = await db.organization.findFirstOrThrow({
      where: { slug: otherChurchSlug },
    });
    const foreign = await db.personProfile.create({
      data: { organizationId: other.id, name: `${NAME_PREFIX} Foreign` },
    });
    for (const [method, body] of [
      ["GET", undefined],
      ["PATCH", bodyOf()],
      ["DELETE", undefined],
    ] as const) {
      const res = await call(method, `/content/people/${foreign.id}`, {
        cookie: editorCookie,
        body,
      });
      expect(res.status, method).toBe(404);
    }
    expect(await db.personProfile.count({ where: { id: foreign.id } })).toBe(1);
    const { data } = (await (
      await call("GET", "/content/people", { cookie: editorCookie })
    ).json()) as PersonProfileListDto;
    expect(data.some((person) => person.id === foreign.id)).toBe(false);
  });
});

describe("PATCH /content/people/:id", () => {
  test("replaces the fields, the bios sent and the whole list of roles, with before and after", async () => {
    const created = await createOk({
      translations: { es: { bio: "uno" }, en: { bio: "one" } },
      roles: [role(), role({ context: "preacher" })],
    });
    const res = await call("PATCH", `/content/people/${created.id}`, {
      cookie: editorCookie,
      body: bodyOf({
        name: `${NAME_PREFIX} Renamed`,
        photoId: readyPhotoId,
        translations: { es: { bio: "dos" } },
        roles: [role({ context: "blog-author", order: 3 })],
      }),
    });
    expect(res.status).toBe(200);
    const updated = (await res.json()) as PersonProfileDto;
    expect(updated.name).toBe(`${NAME_PREFIX} Renamed`);
    expect(updated.photo?.id).toBe(readyPhotoId);
    expect(updated.roles.map((r) => r.context)).toEqual(["blog-author"]);
    // `en` was not sent: it stays as it was.
    expect(updated.translations).toEqual({
      es: { bio: "dos" },
      en: { bio: "one" },
    });

    const [row] = await auditRowsOf({
      entityId: created.id,
      action: AUDIT_ACTIONS.personProfile.updated,
    });
    expect(row?.before).toMatchObject({ name: created.name });
    expect(row?.after).toMatchObject({ name: `${NAME_PREFIX} Renamed` });
  });

  test("replaces the stats of a role", async () => {
    const created = await createOk();
    const stats = [{ label: "Libros", value: "3" }];
    const res = await call("PATCH", `/content/people/${created.id}`, {
      cookie: editorCookie,
      body: bodyOf({
        name: created.name,
        roles: [role({ translations: { es: { title: "Pastor", stats } } })],
      }),
    });
    expect(res.status).toBe(200);
    const updated = (await res.json()) as PersonProfileDto;
    expect(updated.roles[0]?.translations.es?.stats).toEqual(stats);
  });

  test("keeping its own user is fine; taking another profile's user is a 409", async () => {
    const memberUserId = await newMemberId();
    const mine = await createOk({ userId: memberUserId });
    const own = await call("PATCH", `/content/people/${mine.id}`, {
      cookie: editorCookie,
      body: bodyOf({ userId: memberUserId, name: `${NAME_PREFIX} Mine` }),
    });
    expect(own.status).toBe(200);
    const other = await createOk({ name: `${NAME_PREFIX} Other` });
    const taken = await call("PATCH", `/content/people/${other.id}`, {
      cookie: editorCookie,
      body: bodyOf({ userId: memberUserId }),
    });
    expect(taken.status).toBe(409);
  });

  test("invalid references are a 400 and change nothing", async () => {
    const created = await createOk();
    const res = await call("PATCH", `/content/people/${created.id}`, {
      cookie: editorCookie,
      body: bodyOf({ photoId: pendingPhotoId, name: `${NAME_PREFIX} Nope` }),
    });
    expect(res.status).toBe(400);
    const after = await call("GET", `/content/people/${created.id}`, {
      cookie: editorCookie,
    });
    expect(((await after.json()) as PersonProfileDto).name).toBe(created.name);
  });

  test("people:view cannot patch", async () => {
    const created = await createOk();
    const res = await call("PATCH", `/content/people/${created.id}`, {
      cookie: viewerCookie,
      body: bodyOf(),
    });
    expect(res.status).toBe(403);
  });
});

describe("DELETE /content/people/:id", () => {
  test("removes the profile, its roles and titles, and audits it", async () => {
    const created = await createOk({
      roles: [role(), role({ context: "preacher" })],
    });
    const res = await call("DELETE", `/content/people/${created.id}`, {
      cookie: editorCookie,
    });
    expect(res.status).toBe(204);
    expect(await db.personProfile.count({ where: { id: created.id } })).toBe(0);
    expect(
      await db.personRole.count({ where: { personProfileId: created.id } }),
    ).toBe(0);
    expect(
      await db.personProfileTranslation.count({
        where: { personProfileId: created.id },
      }),
    ).toBe(0);
    const again = await call("DELETE", `/content/people/${created.id}`, {
      cookie: editorCookie,
    });
    expect(again.status).toBe(404);

    const [row] = await auditRowsOf({
      entityId: created.id,
      action: AUDIT_ACTIONS.personProfile.deleted,
    });
    expect(row?.before).toMatchObject({ id: created.id });
    expect(row?.after).toBeNull();
  });
});

describe("GET /public/v1/:churchSlug/people", () => {
  test("context is required and must be a known one", async () => {
    expect((await getPublic(null)).status).toBe(400);
    expect((await getPublic("nope")).status).toBe(400);
    expect((await getPublic("TEAM")).status).toBe(400);
  });

  test("needs the site key of that church", async () => {
    const noKey = await call("GET", `/public/v1/${slug}/people?context=team`);
    expect(noKey.status).toBe(401);
    expect((await getPublic("team", "", otherChurchKey)).status).toBe(401);
    expect((await getPublic("team", "", siteKey, otherChurchSlug)).status).toBe(
      401,
    );
  });

  test("a person hidden in team but visible as preacher only shows in the preacher context", async () => {
    const name = `${NAME_PREFIX} Hidden Team`;
    await createOk({
      name,
      roles: [
        role({ context: "team", visible: false }),
        role({ context: "preacher", visible: true }),
      ],
    });
    const team = await publicPeople("team");
    expect(team.map((person) => person.name)).not.toContain(name);
    const preachers = await publicPeople("preacher");
    expect(preachers.map((person) => person.name)).toContain(name);
  });

  test("orders by role order, then name; carries title, bio, initials and cache policy", async () => {
    await createOk({
      name: `${NAME_PREFIX} Zeta`,
      roles: [role({ context: "ministry-leader", order: 1 })],
    });
    await createOk({
      name: `${NAME_PREFIX} Alfa`,
      roles: [role({ context: "ministry-leader", order: 1 })],
    });
    await createOk({
      name: `${NAME_PREFIX} Primero`,
      roles: [
        role({
          context: "ministry-leader",
          order: 0,
          translations: { es: { title: "Líder" } },
        }),
      ],
    });
    const res = await getPublic("ministry-leader");
    expect(res.headers.get("Cache-Control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    const list = (await res.json()) as Record<string, unknown>[];
    const mine = list
      .map((person) => person.name as string)
      .filter((name) => name.startsWith(NAME_PREFIX));
    expect(mine).toEqual([
      `${NAME_PREFIX} Primero`,
      `${NAME_PREFIX} Alfa`,
      `${NAME_PREFIX} Zeta`,
    ]);
    const first = list.find(
      (person) => person.name === `${NAME_PREFIX} Primero`,
    );
    expect(first?.title).toBe("Líder");
    expect(first?.initials).toBe("ZP");
    expect(first?.bio).toBe("Bio en español");
  });

  test("a locale without title or bio falls back to the default language", async () => {
    await createOk({
      name: `${NAME_PREFIX} Fallback`,
      roles: [role({ context: "blog-author" })],
    });
    const [person] = (await publicPeople("blog-author", "&locale=pt")).filter(
      (entry) => entry.name === `${NAME_PREFIX} Fallback`,
    );
    expect(person?.title).toBe("Pastor");
    expect(person?.bio).toBe("Bio en español");
  });

  test("title and bio are null when no language has them", async () => {
    await createOk({
      name: `${NAME_PREFIX} Empty`,
      translations: {},
      roles: [role({ context: "blog-author", translations: {} })],
    });
    const person = (await publicPeople("blog-author")).find(
      (entry) => entry.name === `${NAME_PREFIX} Empty`,
    );
    expect(person?.title).toBeNull();
    expect(person?.bio).toBeNull();
  });

  test("the body carries no ids nor userId, and matches the public contract", async () => {
    const memberUserId = await newMemberId();
    await createOk({
      name: `${NAME_PREFIX} Public`,
      userId: memberUserId,
      photoId: readyPhotoId,
      roles: [role({ context: "preacher" })],
    });
    const res = await getPublic("preacher");
    const raw = await res.text();
    const list = JSON.parse(raw) as Record<string, unknown>[];
    for (const person of list)
      expect(() => publicPersonDto.parse(person)).not.toThrow();
    for (const key of FORBIDDEN_PUBLIC_KEYS)
      expect(raw).not.toContain(`"${key}"`);
    expect(raw).not.toContain(memberUserId);
  });

  test("the photo is the webp variants as url/width/height, and null while it is not ready", async () => {
    await createOk({
      name: `${NAME_PREFIX} Photo`,
      photoId: readyPhotoId,
      roles: [role({ context: "ministry-leader", order: 5 })],
    });
    const person = (await publicPeople("ministry-leader")).find(
      (entry) => entry.name === `${NAME_PREFIX} Photo`,
    );
    const photo = person?.photo as {
      url: string;
      width: number;
      height: number;
    }[];
    expect(photo.map(({ width, height }) => [width, height])).toEqual([
      [400, 300],
      [800, 600],
    ]);
    expect(photo.every(({ url }) => url.endsWith(".webp"))).toBe(true);

    await db.mediaFile.update({
      where: { id: readyPhotoId },
      data: { status: "pending" },
    });
    try {
      const hidden = (await publicPeople("ministry-leader")).find(
        (entry) => entry.name === `${NAME_PREFIX} Photo`,
      );
      expect(hidden?.photo).toBeNull();
    } finally {
      await db.mediaFile.update({
        where: { id: readyPhotoId },
        data: { status: "ready" },
      });
    }
  });

  test("another church sees none of this church's people", async () => {
    const res = await getPublic("team", "", otherChurchKey, otherChurchSlug);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  test("the seeded team is still served", async () => {
    const team = await publicPeople("team");
    expect(team.length).toBeGreaterThanOrEqual(SEEDED_TEAM_SIZE);
  });
});
