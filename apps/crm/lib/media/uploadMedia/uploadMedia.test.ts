import { describe, expect, test } from "bun:test";
import type { MediaFileDto, Problem } from "@ancla/contracts";
import { MediaUploadError, uploadMedia } from "./uploadMedia";

const FILE_ID = "01900000-0000-7000-8000-000000000001";
const UPLOAD_URL = "http://storage.test/bucket/key?X-Amz-Signature=abc";

const readyFile: MediaFileDto = {
  id: FILE_ID,
  purpose: "contentImage",
  status: "ready",
  contentType: "image/png",
  size: 4,
  originalName: "a.png",
  variants: [{ width: 480, format: "webp", url: "http://media.test/480.webp" }],
  createdAt: "2026-11-19T00:00:00.000Z",
};

const problem = (status: number, detail: string): Problem => ({
  type: "urn:ancla:problem:x",
  title: "x",
  status,
  code: "x",
  detail,
  requestId: "req",
});

interface Call {
  url: string;
  method: string;
  headers: Record<string, string>;
}

/** A fake `fetch` that answers by URL and records what was asked. */
function fakeFetch(answers: { ticket?: Response; put?: Response | Error; finalize?: Response }): {
  fetchImpl: typeof fetch;
  calls: Call[];
} {
  const calls: Call[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({
      url,
      method: init?.method ?? "GET",
      headers: (init?.headers ?? {}) as Record<string, string>,
    });
    if (url.endsWith("/media/uploads")) return answers.ticket;
    if (url === UPLOAD_URL) {
      if (answers.put instanceof Error) throw answers.put;
      return answers.put;
    }
    return answers.finalize;
  }) as typeof fetch;
  return { fetchImpl, calls };
}

const ticketResponse = () =>
  Response.json(
    {
      id: FILE_ID,
      uploadUrl: UPLOAD_URL,
      headers: { "Content-Type": "image/png" },
      expiresAt: "2026-11-19T00:05:00.000Z",
    },
    { status: 201 },
  );

const png = () => new File([new Uint8Array(4)], "a.png", { type: "image/png" });

describe("uploadMedia", () => {
  test("declares, PUTs with the ticket's headers, finalizes and returns the file", async () => {
    const { fetchImpl, calls } = fakeFetch({
      ticket: ticketResponse(),
      put: new Response(null, { status: 200 }),
      finalize: Response.json(readyFile),
    });
    const result = await uploadMedia({ file: png(), purpose: "contentImage", fetchImpl });
    expect(result).toEqual(readyFile);
    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual([
      "POST /api/media/uploads",
      `PUT ${UPLOAD_URL}`,
      `POST /api/media/uploads/${FILE_ID}/finalize`,
    ]);
    expect(calls[1]?.headers).toEqual({ "Content-Type": "image/png" });
  });

  test("a type outside the purpose fails before any request", async () => {
    const { fetchImpl, calls } = fakeFetch({});
    const pdf = new File(["%PDF-"], "a.pdf", { type: "application/pdf" });
    await expect(
      uploadMedia({ file: pdf, purpose: "contentImage", fetchImpl }),
    ).rejects.toMatchObject({
      kind: "unsupportedType",
    });
    expect(calls).toEqual([]);
  });

  test("a file over the maximum fails before any request", async () => {
    const { fetchImpl, calls } = fakeFetch({});
    const big = new File([new Uint8Array(16 * 1024 * 1024)], "big.png", { type: "image/png" });
    await expect(
      uploadMedia({ file: big, purpose: "contentImage", fetchImpl }),
    ).rejects.toMatchObject({
      kind: "tooLarge",
    });
    expect(calls).toEqual([]);
  });

  test("403 on the request becomes `forbidden`", async () => {
    const { fetchImpl } = fakeFetch({
      ticket: Response.json(problem(403, "You are not allowed to do this"), { status: 403 }),
    });
    await expect(
      uploadMedia({ file: png(), purpose: "contentImage", fetchImpl }),
    ).rejects.toMatchObject({
      kind: "forbidden",
      message: "You are not allowed to do this",
    });
  });

  test("422 on finalize becomes `rejected`", async () => {
    const { fetchImpl } = fakeFetch({
      ticket: ticketResponse(),
      put: new Response(null, { status: 200 }),
      finalize: Response.json(
        problem(422, "The content of the file is not the type that was declared"),
        {
          status: 422,
        },
      ),
    });
    await expect(
      uploadMedia({ file: png(), purpose: "contentImage", fetchImpl }),
    ).rejects.toMatchObject({
      kind: "rejected",
    });
  });

  test("a refused or failed PUT becomes `uploadFailed` and never finalizes", async () => {
    for (const put of [new Response(null, { status: 403 }), new Error("offline")]) {
      const { fetchImpl, calls } = fakeFetch({ ticket: ticketResponse(), put });
      const error = await uploadMedia({ file: png(), purpose: "contentImage", fetchImpl }).catch(
        (caught: unknown) => caught,
      );
      expect(error).toBeInstanceOf(MediaUploadError);
      expect((error as MediaUploadError).kind).toBe("uploadFailed");
      expect(calls.some((call) => call.url.endsWith("/finalize"))).toBe(false);
    }
  });
});
