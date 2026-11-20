import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  spyOn,
  test,
} from "bun:test";
import {
  type EditorialInboxDto,
  type EditorialSettingsDto,
  type EditorialStatusDto,
  grant,
  PERMISSIONS,
  type PermissionGrant,
  type RevisionSummaryDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import {
  createRecordingMailer,
  type RecordingMailer,
} from "../../../test/support/recordingMailer";
import { getAuth } from "../../core/auth";
import { type Mailer, setMailerForTests } from "../../core/mail";
import { resolveOrganizationId } from "../../core/tenancy";
import { isUniqueViolation } from "./data";
import { findLiveSnapshot, listLiveSnapshots } from "./index";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const VIEW = grant(PERMISSIONS.ministryProfile.view);
const EDIT = grant(PERMISSIONS.ministryProfile.edit);
const PUBLISH = grant(PERMISSIONS.ministryProfile.publish);

interface TestUser {
  id: string;
  email: string;
  name: string;
  cookie: string;
  roleIds: string[];
}

let organizationId = "";
let admin: TestUser;
let editor: TestUser;
let publisher: TestUser;
let mailer: RecordingMailer;

afterAll(async () => {
  setMailerForTests(undefined);
  await db.editorialSettings.deleteMany({ where: { organizationId } });
  await fixtures.cleanup();
});

async function makeUser(
  label: string,
  access: readonly string[] | readonly PermissionGrant[],
  options: { ministryIds?: string[] } = {},
): Promise<TestUser> {
  const auth = getAuth();
  const email = await fixtures.passwordUser(auth, label, access, options);
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  const roles = await db.userRole.findMany({ where: { userId: user.id } });
  return {
    id: user.id,
    email,
    name: user.name,
    cookie: await fixtures.signIn(auth, email),
    roleIds: roles.map((role) => role.roleId),
  };
}

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  admin = await makeUser("editorial-admin", ["admin"]);
  editor = await makeUser("editorial-editor", [VIEW, EDIT]);
  publisher = await makeUser("editorial-publisher", [VIEW, EDIT, PUBLISH]);
});

beforeEach(async () => {
  await db.editorialSettings.deleteMany({ where: { organizationId } });
  mailer = createRecordingMailer();
  setMailerForTests(mailer);
});

async function configure(
  settings: Partial<Omit<EditorialSettingsDto, "contentType">>,
): Promise<void> {
  await db.editorialSettings.create({
    data: { organizationId, contentType: "MINISTRY", ...settings },
  });
}

const newEntity = (): string => crypto.randomUUID();
const urlOf = (entityId: string, suffix = ""): string =>
  `/editorial/ministry/${entityId}${suffix}`;

async function act(
  user: TestUser,
  entityId: string,
  action: string,
  body?: unknown,
): Promise<Response> {
  const method = action === "draft" ? "PUT" : "POST";
  return call(method, urlOf(entityId, `/${action}`), {
    cookie: user.cookie,
    body,
  });
}

async function expectOk(res: Response): Promise<EditorialStatusDto> {
  expect(res.status).toBe(200);
  return (await res.json()) as EditorialStatusDto;
}

async function codeOf(res: Response): Promise<string> {
  return ((await res.json()) as { code: string }).code;
}

async function statusOf(
  user: TestUser,
  entityId: string,
): Promise<EditorialStatusDto> {
  return expectOk(await call("GET", urlOf(entityId), { cookie: user.cookie }));
}

const draft = (user: TestUser, entityId: string, title = "v1") =>
  act(user, entityId, "draft", { snapshot: { title } });

/** A revision submitted by `author`, ready for a reviewer to decide. */
async function inReview(
  author: TestUser,
  entityId = newEntity(),
): Promise<string> {
  await expectOk(await draft(author, entityId));
  await expectOk(await act(author, entityId, "submit"));
  return entityId;
}

describe("state transitions over HTTP", () => {
  test("an action that does not fit the state is a 409 invalid_transition", async () => {
    const entityId = newEntity();
    await expectOk(await draft(editor, entityId));

    const approveDraft = await act(admin, entityId, "approve");
    expect(approveDraft.status).toBe(409);
    expect(await codeOf(approveDraft)).toBe("invalid_transition");

    await expectOk(await act(editor, entityId, "submit"));
    expect((await act(editor, entityId, "submit")).status).toBe(409);
    expect((await draft(editor, entityId, "v2")).status).toBe(409);
    expect((await act(publisher, entityId, "pause")).status).toBe(409);
  });

  test("submitting or pausing an entity with nothing is a 409", async () => {
    expect((await act(editor, newEntity(), "submit")).status).toBe(409);
    expect((await act(publisher, newEntity(), "pause")).status).toBe(409);
    expect((await act(publisher, newEntity(), "publish")).status).toBe(409);
  });

  test("the status carries the working snapshot and what the user can do", async () => {
    const entityId = newEntity();
    const created = await expectOk(await draft(editor, entityId, "hello"));
    expect(created.working?.state).toBe("draft");
    expect(created.working?.snapshot).toEqual({ title: "hello" });
    expect(created.live).toBeNull();
    expect(created.availableActions).toEqual(["saveDraft", "submit"]);
  });
});

describe("publishing without review", () => {
  test("without publish a direct publish is a 403, and the same user can submit", async () => {
    const entityId = newEntity();
    await expectOk(await draft(editor, entityId));
    expect((await act(editor, entityId, "publish")).status).toBe(403);
    await expectOk(await act(editor, entityId, "submit"));
  });

  test("a publisher under mandatory review by user cannot publish directly", async () => {
    const user = await makeUser("mandatory-user", [VIEW, EDIT, PUBLISH]);
    await configure({ mandatoryReviewUserIds: [user.id] });
    const entityId = newEntity();
    const created = await expectOk(await draft(user, entityId));
    expect(created.availableActions).not.toContain("publish");
    const res = await act(user, entityId, "publish");
    expect(res.status).toBe(403);
    expect(await codeOf(res)).toBe("review_required");
  });

  test("a publisher under mandatory review by role cannot publish directly", async () => {
    const user = await makeUser("mandatory-role", [VIEW, EDIT, PUBLISH]);
    await configure({ mandatoryReviewRoleIds: user.roleIds });
    const entityId = newEntity();
    const created = await expectOk(await draft(user, entityId));
    expect(created.availableActions).not.toContain("publish");
    expect((await act(user, entityId, "publish")).status).toBe(403);
  });

  test("a publisher cannot bypass the review of an author under mandatory review", async () => {
    await configure({ mandatoryReviewUserIds: [editor.id] });
    const entityId = newEntity();
    await expectOk(await draft(editor, entityId));
    expect(
      (await statusOf(publisher, entityId)).availableActions,
    ).not.toContain("publish");
    expect((await act(publisher, entityId, "publish")).status).toBe(403);
  });

  test("a publisher publishes directly, and the live revision shows in the status", async () => {
    const entityId = newEntity();
    await expectOk(await draft(publisher, entityId));
    const published = await expectOk(await act(publisher, entityId, "publish"));
    expect(published.live?.state).toBe("published");
    expect(published.working).toBeNull();
    expect(published.availableActions).toEqual(["saveDraft", "pause"]);
  });
});

describe("editing published content", () => {
  test("the live snapshot stays until approval, then the old revision is superseded", async () => {
    const entityId = newEntity();
    await draft(publisher, entityId, "old");
    await expectOk(await act(publisher, entityId, "publish"));
    expect(
      await findLiveSnapshot(organizationId, "MINISTRY", entityId),
    ).toEqual({ title: "old" });

    await expectOk(await draft(editor, entityId, "new"));
    await expectOk(await act(editor, entityId, "submit"));
    expect(
      await findLiveSnapshot(organizationId, "MINISTRY", entityId),
    ).toEqual({ title: "old" });

    await expectOk(await act(admin, entityId, "approve"));
    expect(
      await findLiveSnapshot(organizationId, "MINISTRY", entityId),
    ).toEqual({ title: "new" });

    const history = (await (
      await call("GET", urlOf(entityId, "/history"), { cookie: admin.cookie })
    ).json()) as RevisionSummaryDto[];
    expect(
      history.map((revision) => [revision.number, revision.state]),
    ).toEqual([
      [2, "published"],
      [1, "superseded"],
    ]);
    expect(history[0]?.reviewer?.id).toBe(admin.id);
  });
});

describe("who can approve", () => {
  test("a user with publish who is not a reviewer cannot approve", async () => {
    const entityId = await inReview(editor);
    const res = await act(publisher, entityId, "approve");
    expect(res.status).toBe(403);
    expect(await codeOf(res)).toBe("not_reviewer");
    expect(
      (await act(publisher, entityId, "request-changes", { comment: "no" }))
        .status,
    ).toBe(403);
  });

  test("a reviewer by role approves", async () => {
    const reviewer = await makeUser("role-reviewer", [VIEW]);
    await configure({ reviewerRoleIds: reviewer.roleIds });
    const entityId = await inReview(editor);
    const approved = await expectOk(await act(reviewer, entityId, "approve"));
    expect(approved.live?.state).toBe("published");
  });

  test("a reviewer by name approves", async () => {
    const reviewer = await makeUser("named-reviewer", [VIEW]);
    await configure({ reviewerUserIds: [reviewer.id] });
    const entityId = await inReview(editor);
    await expectOk(await act(reviewer, entityId, "approve"));
  });

  test("nobody reviews their own revision, not even the admin", async () => {
    const entityId = await inReview(admin);
    const approve = await act(admin, entityId, "approve");
    expect(approve.status).toBe(403);
    expect(await codeOf(approve)).toBe("self_review");
    expect(
      (await act(admin, entityId, "request-changes", { comment: "x" })).status,
    ).toBe(403);

    const reviewer = await makeUser("self-reviewer", [VIEW, EDIT]);
    await configure({ reviewerUserIds: [reviewer.id] });
    const own = await inReview(reviewer);
    expect((await act(reviewer, own, "approve")).status).toBe(403);
  });
});

describe("requesting changes", () => {
  test("it needs a comment, goes back to the author, and editing returns it to draft", async () => {
    const entityId = await inReview(editor);
    expect((await act(admin, entityId, "request-changes", {})).status).toBe(
      400,
    );
    expect(
      (await act(admin, entityId, "request-changes", { comment: "  " })).status,
    ).toBe(400);

    const returned = await expectOk(
      await act(admin, entityId, "request-changes", {
        comment: "Fix the title",
      }),
    );
    expect(returned.working?.state).toBe("changes_requested");
    expect(returned.working?.comment).toBe("Fix the title");

    const inbox = (await (
      await call("GET", "/editorial/inbox", { cookie: editor.cookie })
    ).json()) as EditorialInboxDto;
    const item = inbox.changesRequested.find(
      (entry) => entry.entityId === entityId,
    );
    expect(item?.comment).toBe("Fix the title");
    expect(item?.crmPath).toBe(`/ministries/${entityId}`);

    const edited = await expectOk(await draft(editor, entityId, "v2"));
    expect(edited.working?.state).toBe("draft");
    const after = (await (
      await call("GET", "/editorial/inbox", { cookie: editor.cookie })
    ).json()) as EditorialInboxDto;
    expect(
      after.changesRequested.some((entry) => entry.entityId === entityId),
    ).toBe(false);
  });

  test("the inbox of a reviewer lists what waits for review, never their own revisions", async () => {
    const reviewer = await makeUser("inbox-reviewer", [VIEW, EDIT]);
    await configure({ reviewerUserIds: [reviewer.id] });
    const theirs = await inReview(editor);
    const own = await inReview(reviewer);
    const inbox = (await (
      await call("GET", "/editorial/inbox", { cookie: reviewer.cookie })
    ).json()) as EditorialInboxDto;
    const ids = inbox.toReview.map((entry) => entry.entityId);
    expect(ids).toContain(theirs);
    expect(ids).not.toContain(own);

    const nobody = (await (
      await call("GET", "/editorial/inbox", { cookie: publisher.cookie })
    ).json()) as EditorialInboxDto;
    expect(nobody.toReview).toEqual([]);
  });
});

describe("pausing", () => {
  test("a paused entity disappears from the live reads and publish resumes it", async () => {
    const entityId = newEntity();
    await draft(publisher, entityId, "kept");
    await expectOk(await act(publisher, entityId, "publish"));

    const paused = await expectOk(await act(publisher, entityId, "pause"));
    expect(paused.live?.state).toBe("paused");
    expect(paused.availableActions).toContain("resume");
    expect(
      await findLiveSnapshot(organizationId, "MINISTRY", entityId),
    ).toBeNull();
    const listed = await listLiveSnapshots(organizationId, "MINISTRY");
    expect(listed.some((entry) => entry.entityId === entityId)).toBe(false);

    const resumed = await expectOk(await act(publisher, entityId, "publish"));
    expect(resumed.live?.state).toBe("published");
    expect(
      await findLiveSnapshot(organizationId, "MINISTRY", entityId),
    ).toEqual({ title: "kept" });
    const again = await listLiveSnapshots(organizationId, "MINISTRY");
    expect(again.some((entry) => entry.entityId === entityId)).toBe(true);
  });

  test("a publisher under mandatory review can still resume approved content", async () => {
    const entityId = newEntity();
    await draft(publisher, entityId);
    await act(publisher, entityId, "publish");
    await act(publisher, entityId, "pause");
    await configure({ mandatoryReviewUserIds: [publisher.id] });
    await expectOk(await act(publisher, entityId, "publish"));
  });
});

describe("audit", () => {
  test("every transition leaves its row with the request id and no snapshot", async () => {
    const entityId = newEntity();
    const steps: [Response, string][] = [];
    steps.push([await draft(editor, entityId), "editorial.draftSaved"]);
    steps.push([await act(editor, entityId, "submit"), "editorial.submitted"]);
    steps.push([
      await act(admin, entityId, "request-changes", { comment: "again" }),
      "editorial.changesRequested",
    ]);
    steps.push([await draft(editor, entityId, "v2"), "editorial.draftSaved"]);
    steps.push([await act(editor, entityId, "submit"), "editorial.submitted"]);
    steps.push([await act(admin, entityId, "approve"), "editorial.approved"]);
    steps.push([await act(publisher, entityId, "pause"), "editorial.paused"]);
    steps.push([
      await act(publisher, entityId, "publish"),
      "editorial.resumed",
    ]);
    const direct = newEntity();
    await draft(publisher, direct);
    steps.push([
      await act(publisher, direct, "publish"),
      "editorial.published",
    ]);

    for (const [res, action] of steps) {
      expect(res.status).toBe(200);
      const rows = await auditRowsOf({ requestId: requestIdOf(res), action });
      expect({ action, rows: rows.length }).toEqual({ action, rows: 1 });
      const serialized = JSON.stringify(rows[0]);
      expect(serialized).not.toContain("snapshot");
      expect(serialized).toContain('"number"');
    }
  });
});

describe("emails", () => {
  test("submit goes to the configured reviewers, not to the author", async () => {
    const reviewer = await makeUser("mail-reviewer", [VIEW]);
    await configure({ reviewerUserIds: [reviewer.id, editor.id] });
    await inReview(editor);
    expect(mailer.sent.map((message) => message.to)).toEqual([reviewer.email]);
    expect(mailer.sent[0]?.subject).toContain("revisión");
  });

  test("without reviewers configured the admins are told", async () => {
    await inReview(editor);
    const recipients = mailer.sent.map((message) => message.to);
    expect(recipients).toContain(admin.email);
    expect(recipients).not.toContain(editor.email);
  });

  test("approve and request changes email the author, with the comment", async () => {
    const first = await inReview(editor);
    mailer.sent.length = 0;
    await act(admin, first, "request-changes", { comment: "Add a photo" });
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]?.to).toBe(editor.email);
    expect(mailer.sent[0]?.text).toContain("Add a photo");

    const second = await inReview(editor);
    mailer.sent.length = 0;
    await act(admin, second, "approve");
    expect(mailer.sent.map((message) => message.to)).toEqual([editor.email]);
    expect(mailer.sent[0]?.html).toContain("/ministries/");
  });

  test("a mailer that fails does not break the request", async () => {
    const failing: Mailer = {
      async send() {
        throw new Error("smtp down");
      },
    };
    setMailerForTests(failing);
    const error = spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const entityId = newEntity();
      await draft(editor, entityId);
      expect((await act(editor, entityId, "submit")).status).toBe(200);
      expect((await statusOf(editor, entityId)).working?.state).toBe(
        "in_review",
      );
      expect(error).toHaveBeenCalled();
    } finally {
      error.mockRestore();
    }
  });
});

describe("ministry scope", () => {
  test("a leader edits their own ministry and not another", async () => {
    const own = await fixtures.createMinistry("editorial-own");
    const other = await fixtures.createMinistry("editorial-other");
    const leader = await makeUser(
      "editorial-leader",
      [
        grant(PERMISSIONS.ministryProfile.view, "ministry"),
        grant(PERMISSIONS.ministryProfile.edit, "ministry"),
      ],
      { ministryIds: [own] },
    );
    const mine = await call("PUT", `/editorial/ministry/${own}/draft`, {
      cookie: leader.cookie,
      body: { snapshot: { name: "x" } },
    });
    expect(mine.status).toBe(200);
    expect(
      ((await mine.json()) as EditorialStatusDto).availableActions,
    ).toEqual(["saveDraft", "submit"]);
    for (const [method, suffix] of [
      ["PUT", "/draft"],
      ["POST", "/submit"],
      ["GET", ""],
    ] as const) {
      const res = await call(method, `/editorial/ministry/${other}${suffix}`, {
        cookie: leader.cookie,
        body: method === "PUT" ? { snapshot: {} } : undefined,
      });
      expect({ suffix, status: res.status }).toEqual({ suffix, status: 403 });
    }
  });

  test("an unknown content type is a 404", async () => {
    const res = await call("GET", `/editorial/nope/${newEntity()}`, {
      cookie: admin.cookie,
    });
    expect(res.status).toBe(404);
  });
});

describe("settings", () => {
  test("only editorial:edit saves, editorial:view reads, and the save is audited", async () => {
    const viewer = await makeUser("settings-viewer", [
      grant(PERMISSIONS.editorial.view),
    ]);
    const manager = await makeUser("settings-manager", [
      grant(PERMISSIONS.editorial.view),
      grant(PERMISSIONS.editorial.edit),
    ]);
    const body = {
      reviewerRoleIds: [],
      reviewerUserIds: [editor.id],
      mandatoryReviewRoleIds: [],
      mandatoryReviewUserIds: [publisher.id, publisher.id],
    };
    expect(
      (await call("GET", "/editorial/settings", { cookie: viewer.cookie }))
        .status,
    ).toBe(200);
    expect(
      (
        await call("PUT", "/editorial/settings/ministry", {
          cookie: viewer.cookie,
          body,
        })
      ).status,
    ).toBe(403);

    const saved = await call("PUT", "/editorial/settings/ministry", {
      cookie: manager.cookie,
      body,
    });
    expect(saved.status).toBe(200);
    expect(
      ((await saved.json()) as EditorialSettingsDto).mandatoryReviewUserIds,
    ).toEqual([publisher.id]);
    const rows = await auditRowsOf({
      requestId: requestIdOf(saved),
      action: "editorial.settingsUpdated",
    });
    expect(rows).toHaveLength(1);

    const list = (await (
      await call("GET", "/editorial/settings", { cookie: manager.cookie })
    ).json()) as EditorialSettingsDto[];
    expect(list.map((entry) => entry.contentType)).toEqual([
      "blog-post",
      "ministry",
      "simple-page",
    ]);
    expect(list[1]?.reviewerUserIds).toEqual([editor.id]);
    expect(list[0]?.reviewerUserIds).toEqual([]);
  });

  test("ids that are not from the organization are a 400", async () => {
    const other = await fixtures.createOrganization("editorial-foreign");
    const foreignRole = await db.role.create({
      data: {
        organizationId: other.id,
        name: `foreign-${crypto.randomUUID()}`,
      },
    });
    const empty = {
      reviewerRoleIds: [],
      reviewerUserIds: [],
      mandatoryReviewRoleIds: [],
      mandatoryReviewUserIds: [],
    };
    for (const body of [
      { ...empty, reviewerRoleIds: [foreignRole.id] },
      { ...empty, mandatoryReviewRoleIds: [foreignRole.id] },
      { ...empty, reviewerUserIds: [crypto.randomUUID()] },
      { ...empty, mandatoryReviewUserIds: [crypto.randomUUID()] },
    ]) {
      const res = await call("PUT", "/editorial/settings/ministry", {
        cookie: admin.cookie,
        body,
      });
      expect(res.status).toBe(400);
    }
  });

  test("an id of a deleted role stops counting when read", async () => {
    const role = await fixtures.createRole("short-lived");
    await configure({ reviewerRoleIds: [role] });
    await db.role.delete({ where: { id: role } });
    const list = (await (
      await call("GET", "/editorial/settings", { cookie: admin.cookie })
    ).json()) as EditorialSettingsDto[];
    expect(list[0]?.reviewerRoleIds).toEqual([]);
  });
});

describe("concurrency", () => {
  test("saves racing on a new entity never leave two working revisions", async () => {
    const entityId = newEntity();
    const results = await Promise.all(
      ["a", "b", "c", "d"].map((title) => draft(editor, entityId, title)),
    );
    // A loser either hits the partial unique index (409) or arrives after the winner committed
    // and edits the same revision (200): what can never happen is a second working revision.
    const statuses = results.map((res) => res.status);
    expect(statuses).toContain(200);
    expect(statuses.every((status) => status === 200 || status === 409)).toBe(
      true,
    );
    const working = await db.contentRevision.count({
      where: {
        entityId,
        state: { in: ["DRAFT", "IN_REVIEW", "CHANGES_REQUESTED"] },
      },
    });
    expect(working).toBe(1);
  });

  test("the database refuses a second working revision and the error is recognized", async () => {
    const entityId = newEntity();
    const row = (number: number) =>
      db.contentRevision.create({
        data: {
          organizationId,
          contentType: "MINISTRY",
          entityId,
          number,
          state: "DRAFT",
          snapshot: {},
          authorId: editor.id,
        },
      });
    await row(1);
    const error = await row(2).catch((caught: unknown) => caught);
    expect(isUniqueViolation(error)).toBe(true);
  });

  test("two approvals racing publish once", async () => {
    const entityId = await inReview(editor);
    const results = await Promise.all([
      act(admin, entityId, "approve"),
      act(admin, entityId, "approve"),
    ]);
    expect(results.map((res) => res.status).sort()).toEqual([200, 409]);
    const live = await db.contentRevision.count({
      where: { entityId, state: "PUBLISHED" },
    });
    expect(live).toBe(1);
  });
});
