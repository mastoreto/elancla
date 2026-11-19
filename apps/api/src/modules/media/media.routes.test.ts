import {
  afterAll,
  beforeAll,
  describe,
  expect,
  setDefaultTimeout,
  spyOn,
  test,
} from "bun:test";
import {
  type DownloadLinkDto,
  grant,
  type MediaFileDto,
  PERMISSIONS,
  type Problem,
  type UploadTicketDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import sharp from "sharp";
import {
  createApiCaller,
  TEST_USER_AGENT,
} from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import { readMediaFixture } from "../../../test/support/media";
import * as auditModule from "../../core/audit/writeAudit/writeAudit";
import { getAuth } from "../../core/auth";
import { getStorage, getStorageEnv } from "../../core/storage";
import { resolveOrganizationId } from "../../core/tenancy";
import { findMediaFileRow } from "./data";
import { originalKey, variantKey } from "./domain";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
// Finalizing encodes real images (sharp, 3 widths x webp/avif): ~3s alone, over 5s when the whole
// suite runs in parallel under turbo.
const IMAGE_PROCESSING_TIMEOUT_MS = 30_000;
setDefaultTimeout(IMAGE_PROCESSING_TIMEOUT_MS);

const createdIds: string[] = [];
const VARIANT_WIDTHS = [480, 960, 1600];
const VARIANT_FORMATS = ["webp", "avif"] as const;

let organizationId = "";
let adminCookie = "";
let editorCookie = "";
let otherEditorCookie = "";
let clerkCookie = "";
let clerkId = "";
let treasurerCookie = "";
let nobodyCookie = "";

beforeAll(async () => {
  const auth = getAuth();
  organizationId = await resolveOrganizationId();
  const signedIn = async (
    label: string,
    access: Parameters<typeof fixtures.passwordUser>[2],
  ) => {
    const email = await fixtures.passwordUser(auth, label, access);
    return { email, cookie: await fixtures.signIn(auth, email) };
  };
  adminCookie = (await signedIn("media-admin", ["admin"])).cookie;
  editorCookie = (
    await signedIn("media-editor", [grant(PERMISSIONS.content.create)])
  ).cookie;
  otherEditorCookie = (
    await signedIn("media-editor2", [grant(PERMISSIONS.content.create)])
  ).cookie;
  const clerk = await signedIn("media-clerk", [
    grant(PERMISSIONS.vouchers.create, "own"),
    grant(PERMISSIONS.vouchers.view, "own"),
  ]);
  clerkCookie = clerk.cookie;
  clerkId = (await db.user.findUniqueOrThrow({ where: { email: clerk.email } }))
    .id;
  treasurerCookie = (
    await signedIn("media-treasurer", [grant(PERMISSIONS.vouchers.view, "all")])
  ).cookie;
  nobodyCookie = (await signedIn("media-nobody", [])).cookie;
});

afterAll(async () => {
  const privateStorage = getStorage("private");
  const publicStorage = getStorage("public");
  for (const id of createdIds) {
    await privateStorage.delete(originalKey(organizationId, id));
    for (const width of VARIANT_WIDTHS) {
      for (const format of VARIANT_FORMATS) {
        await publicStorage.delete(
          variantKey(organizationId, id, width, format),
        );
      }
    }
    // A single variant at the original's own width (small images).
    await publicStorage.delete(variantKey(organizationId, id, 64, "webp"));
    await publicStorage.delete(variantKey(organizationId, id, 64, "avif"));
  }
  await db.mediaFile.deleteMany({ where: { id: { in: createdIds } } });
  await fixtures.cleanup();
});

interface UploadOptions {
  cookie: string;
  purpose: "contentImage" | "voucherDocument";
  fileName: string;
  /** What the client claims. */
  contentType: string;
  /** What is really sent. */
  bytes: Uint8Array<ArrayBuffer>;
}

async function requestTicket(options: UploadOptions): Promise<UploadTicketDto> {
  const res = await call("POST", "/media/uploads", {
    cookie: options.cookie,
    body: {
      purpose: options.purpose,
      contentType: options.contentType,
      size: options.bytes.byteLength,
      fileName: options.fileName,
    },
  });
  expect(res.status).toBe(201);
  const ticket = (await res.json()) as UploadTicketDto;
  createdIds.push(ticket.id);
  return ticket;
}

async function putBytes(
  ticket: UploadTicketDto,
  bytes: Uint8Array<ArrayBuffer>,
) {
  const res = await fetch(ticket.uploadUrl, {
    method: "PUT",
    headers: ticket.headers,
    body: bytes,
  });
  expect(res.status).toBe(200);
}

/** Request + PUT, leaving the file pending. */
async function upload(options: UploadOptions): Promise<UploadTicketDto> {
  const ticket = await requestTicket(options);
  await putBytes(ticket, options.bytes);
  return ticket;
}

const finalize = (id: string, cookie: string) =>
  call("POST", `/media/uploads/${id}/finalize`, { cookie });

async function uploadAndFinalize(
  options: UploadOptions,
): Promise<MediaFileDto> {
  const ticket = await upload(options);
  const res = await finalize(ticket.id, options.cookie);
  expect(res.status).toBe(200);
  return (await res.json()) as MediaFileDto;
}

const privateHas = async (id: string) =>
  (await getStorage("private").head(originalKey(organizationId, id))) !== null;

async function expectRejected(id: string, res: Response, reason: string) {
  expect(res.status).toBe(422);
  expect(await findMediaFileRow(organizationId, id)).toBeNull();
  expect(await privateHas(id)).toBe(false);
  const [rejected] = await auditRowsOf({
    entityId: id,
    action: "media.rejected",
  });
  expect(rejected?.outcome).toBe("failure");
  expect((rejected?.metadata as { reason: string }).reason).toBe(reason);
}

describe("POST /api/media/uploads", () => {
  test("quarantines in the private bucket with a ticket that signs the declared type", async () => {
    const bytes = await readMediaFixture("photo-with-exif.jpg");
    const ticket = await requestTicket({
      cookie: editorCookie,
      purpose: "contentImage",
      fileName: "../../vacaciones.jpg",
      contentType: "image/jpeg",
      bytes,
    });
    const url = new URL(ticket.uploadUrl);
    expect(url.pathname).toBe(
      `/${getStorageEnv().S3_PRIVATE_BUCKET}/${originalKey(organizationId, ticket.id)}`,
    );
    expect(ticket.headers).toEqual({ "Content-Type": "image/jpeg" });

    const row = await findMediaFileRow(organizationId, ticket.id);
    expect(row?.status).toBe("pending");
    expect(row?.originalName).toBe("vacaciones.jpg");

    const [audited] = await auditRowsOf({ entityId: ticket.id });
    expect(audited?.action).toBe("media.upload.requested");
  });

  test("a PUT with another type than the declared one is refused by the storage", async () => {
    const bytes = await readMediaFixture("tiny.png");
    const ticket = await requestTicket({
      cookie: editorCookie,
      purpose: "contentImage",
      fileName: "x.png",
      contentType: "image/png",
      bytes,
    });
    const res = await fetch(ticket.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "text/html" },
      body: bytes,
    });
    expect(res.ok).toBe(false);
    expect(await privateHas(ticket.id)).toBe(false);
  });

  test("403 without the permission of the purpose, and the denial is audited", async () => {
    const res = await call("POST", "/media/uploads", {
      cookie: nobodyCookie,
      body: {
        purpose: "contentImage",
        contentType: "image/png",
        size: 10,
        fileName: "a.png",
      },
    });
    expect(res.status).toBe(403);
    const rows = await auditRowsOf({ requestId: requestIdOf(res) });
    expect(rows.map((row) => row.action)).toContain("permission.denied");
  });

  test("the permission is the purpose's: content:create cannot upload vouchers", async () => {
    const res = await call("POST", "/media/uploads", {
      cookie: editorCookie,
      body: {
        purpose: "voucherDocument",
        contentType: "application/pdf",
        size: 10,
        fileName: "a.pdf",
      },
    });
    expect(res.status).toBe(403);
  });

  test("400 for a type or a size outside the purpose", async () => {
    const wrongType = await call("POST", "/media/uploads", {
      cookie: editorCookie,
      body: {
        purpose: "contentImage",
        contentType: "application/pdf",
        size: 10,
        fileName: "a.pdf",
      },
    });
    const tooBig = await call("POST", "/media/uploads", {
      cookie: editorCookie,
      body: {
        purpose: "contentImage",
        contentType: "image/png",
        size: 16 * 1024 * 1024,
        fileName: "a.png",
      },
    });
    expect([wrongType.status, tooBig.status]).toEqual([400, 400]);
  });
});

describe("POST /api/media/uploads/:id/finalize", () => {
  test("a valid image gets public variants without EXIF, never wider than the original", async () => {
    const bytes = await readMediaFixture("photo-with-exif.jpg");
    const file = await uploadAndFinalize({
      cookie: editorCookie,
      purpose: "contentImage",
      fileName: "photo.jpg",
      contentType: "image/jpeg",
      bytes,
    });
    expect(file.status).toBe("ready");
    expect(file.variants.length).toBeGreaterThan(0);
    // The fixture is 1200 px wide.
    expect(
      Math.max(...file.variants.map((variant) => variant.width)),
    ).toBeLessThanOrEqual(1200);

    const base = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
    for (const variant of file.variants) {
      expect(
        variant.url.startsWith(`${base}/${organizationId}/${file.id}/`),
      ).toBe(true);
      const res = await fetch(variant.url); // anonymous: no credentials
      expect(res.status).toBe(200);
      const metadata = await sharp(
        new Uint8Array(await res.arrayBuffer()),
      ).metadata();
      expect(metadata.exif).toBeUndefined();
      expect(metadata.width).toBe(variant.width);
    }

    const row = await findMediaFileRow(organizationId, file.id);
    expect(row?.checksum).toBe(
      new Bun.CryptoHasher("sha256").update(bytes).digest("hex"),
    );
    expect(row?.finalizedAt).not.toBeNull();
    const actions = (await auditRowsOf({ entityId: file.id })).map(
      (r) => r.action,
    );
    expect(actions).toEqual(["media.upload.requested", "media.finalized"]);
  });

  test("the original stays private: anonymous reads of the private bucket fail", async () => {
    const file = await uploadAndFinalize({
      cookie: editorCookie,
      purpose: "contentImage",
      fileName: "tiny.png",
      contentType: "image/png",
      bytes: await readMediaFixture("tiny.png"),
    });
    const { S3_ENDPOINT, S3_PRIVATE_BUCKET } = getStorageEnv();
    const res = await fetch(
      `${S3_ENDPOINT}/${S3_PRIVATE_BUCKET}/${originalKey(organizationId, file.id)}`,
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
    // An image smaller than the smallest step keeps a single width.
    expect([...new Set(file.variants.map((variant) => variant.width))]).toEqual(
      [64],
    );
  });

  test("a PDF declared as image/png is rejected and removed", async () => {
    const ticket = await upload({
      cookie: editorCookie,
      purpose: "contentImage",
      fileName: "fake.png",
      contentType: "image/png",
      bytes: await readMediaFixture("document.pdf"),
    });
    const res = await finalize(ticket.id, editorCookie);
    await expectRejected(ticket.id, res, "contentTypeMismatch");
    const body = (await res.json()) as Problem;
    expect(body.code).toBe("unprocessable");
  });

  test("HTML uploaded as image/jpeg is rejected and removed", async () => {
    const ticket = await upload({
      cookie: editorCookie,
      purpose: "contentImage",
      fileName: "payload.jpg",
      contentType: "image/jpeg",
      bytes: await readMediaFixture("page.html"),
    });
    await expectRejected(
      ticket.id,
      await finalize(ticket.id, editorCookie),
      "contentTypeMismatch",
    );
  });

  test("a real size different from the declared one is rejected", async () => {
    const declared = await readMediaFixture("tiny.png");
    const ticket = await requestTicket({
      cookie: editorCookie,
      purpose: "contentImage",
      fileName: "lies.png",
      contentType: "image/png",
      bytes: declared,
    });
    // Bypasses the presigned PUT (which would refuse it) to simulate a storage that does not.
    await getStorage("private").put({
      key: originalKey(organizationId, ticket.id),
      body: await readMediaFixture("photo-with-exif.jpg"),
      contentType: "image/png",
    });
    await expectRejected(
      ticket.id,
      await finalize(ticket.id, editorCookie),
      "sizeMismatch",
    );
  });

  test("finalizing something that was never uploaded is rejected", async () => {
    const ticket = await requestTicket({
      cookie: editorCookie,
      purpose: "contentImage",
      fileName: "ghost.png",
      contentType: "image/png",
      bytes: await readMediaFixture("tiny.png"),
    });
    await expectRejected(
      ticket.id,
      await finalize(ticket.id, editorCookie),
      "objectMissing",
    );
  });

  test("a second finalize is 409", async () => {
    const file = await uploadAndFinalize({
      cookie: editorCookie,
      purpose: "contentImage",
      fileName: "tiny.png",
      contentType: "image/png",
      bytes: await readMediaFixture("tiny.png"),
    });
    expect((await finalize(file.id, editorCookie)).status).toBe(409);
  });

  test("only the uploader may finalize: anyone else gets 404", async () => {
    const ticket = await upload({
      cookie: editorCookie,
      purpose: "contentImage",
      fileName: "tiny.png",
      contentType: "image/png",
      bytes: await readMediaFixture("tiny.png"),
    });
    expect((await finalize(ticket.id, otherEditorCookie)).status).toBe(404);
    expect((await finalize(ticket.id, adminCookie)).status).toBe(404);
    expect((await findMediaFileRow(organizationId, ticket.id))?.status).toBe(
      "pending",
    );
  });
});

describe("GET /api/media/:id/download", () => {
  let voucher: MediaFileDto;
  let voucherBytes: Uint8Array<ArrayBuffer>;

  beforeAll(async () => {
    voucherBytes = await readMediaFixture("document.pdf");
    voucher = await uploadAndFinalize({
      cookie: clerkCookie,
      purpose: "voucherDocument",
      fileName: "Factura agosto.pdf",
      contentType: "application/pdf",
      bytes: voucherBytes,
    });
  });

  test("a private file has no public variants", () => {
    expect(voucher.variants).toEqual([]);
  });

  test("403 without permission: no link and no downloadIssued row, but a denial", async () => {
    const res = await call("GET", `/media/${voucher.id}/download`, {
      cookie: nobodyCookie,
    });
    expect(res.status).toBe(403);
    const rows = await auditRowsOf({ requestId: requestIdOf(res) });
    expect(rows.map((row) => row.action)).toEqual(["permission.denied"]);
    expect(
      await auditRowsOf({
        entityId: voucher.id,
        action: "media.download.issued",
      }),
    ).toEqual([]);
  });

  test("with permission: a short-lived attachment link, audited with actor, address and request id", async () => {
    const res = await call("GET", `/media/${voucher.id}/download`, {
      cookie: treasurerCookie,
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toContain("no-store");
    const link = (await res.json()) as DownloadLinkDto;
    const secondsLeft =
      (new Date(link.expiresAt).getTime() - Date.now()) / 1000;
    expect(secondsLeft).toBeGreaterThan(50);
    expect(secondsLeft).toBeLessThanOrEqual(60);

    const file = await fetch(link.url);
    expect(file.status).toBe(200);
    expect(file.headers.get("content-disposition")).toStartWith("attachment");
    expect(new Uint8Array(await file.arrayBuffer())).toEqual(voucherBytes);

    const [issued] = await auditRowsOf({ requestId: requestIdOf(res) });
    expect(issued?.action).toBe("media.download.issued");
    expect(issued?.entityId).toBe(voucher.id);
    expect(issued?.actorLabel).toContain("media-treasurer");
    expect(issued?.userAgent).toBe(TEST_USER_AGENT);
    expect(issued?.ip).toStartWith("10.250.");
  });

  test("scope own: the uploader gets the link, another user with `own` does not", async () => {
    const mine = await call("GET", `/media/${voucher.id}/download`, {
      cookie: clerkCookie,
    });
    expect(mine.status).toBe(200);

    const strangerFile = await uploadAndFinalize({
      cookie: adminCookie,
      purpose: "voucherDocument",
      fileName: "ajeno.pdf",
      contentType: "application/pdf",
      bytes: voucherBytes,
    });
    const theirs = await call("GET", `/media/${strangerFile.id}/download`, {
      cookie: clerkCookie,
    });
    expect(theirs.status).toBe(403);
    expect(
      await auditRowsOf({
        entityId: strangerFile.id,
        action: "media.download.issued",
      }),
    ).toEqual([]);
  });

  test("409 for a public purpose and for a pending file; 404 for an unknown id", async () => {
    const image = await uploadAndFinalize({
      cookie: adminCookie,
      purpose: "contentImage",
      fileName: "tiny.png",
      contentType: "image/png",
      bytes: await readMediaFixture("tiny.png"),
    });
    expect(
      (
        await call("GET", `/media/${image.id}/download`, {
          cookie: adminCookie,
        })
      ).status,
    ).toBe(409);

    const pending = await upload({
      cookie: clerkCookie,
      purpose: "voucherDocument",
      fileName: "pending.pdf",
      contentType: "application/pdf",
      bytes: voucherBytes,
    });
    expect(
      (
        await call("GET", `/media/${pending.id}/download`, {
          cookie: adminCookie,
        })
      ).status,
    ).toBe(409);

    expect(
      (
        await call(
          "GET",
          "/media/01900000-0000-7000-8000-000000000000/download",
          {
            cookie: adminCookie,
          },
        )
      ).status,
    ).toBe(404);
  });

  test("if the audit insert fails, no link is issued (500)", async () => {
    const failing = spyOn(auditModule, "writeAudit").mockRejectedValue(
      new Error("audit trail unavailable"),
    );
    try {
      const res = await call("GET", `/media/${voucher.id}/download`, {
        cookie: treasurerCookie,
      });
      expect(res.status).toBe(500);
      expect(JSON.stringify(await res.json())).not.toContain("X-Amz-Signature");
    } finally {
      failing.mockRestore();
    }
  });
});

describe("tenant isolation of the repository", () => {
  test("a file is invisible from another organization", async () => {
    const file = await uploadAndFinalize({
      cookie: clerkCookie,
      purpose: "voucherDocument",
      fileName: "mine.pdf",
      contentType: "application/pdf",
      bytes: await readMediaFixture("document.pdf"),
    });
    expect(await findMediaFileRow(organizationId, file.id)).not.toBeNull();
    expect(
      await findMediaFileRow("01900000-0000-7000-8000-0000000000aa", file.id),
    ).toBeNull();
    expect(
      (await findMediaFileRow(organizationId, file.id))?.uploadedById,
    ).toBe(clerkId);
  });
});
