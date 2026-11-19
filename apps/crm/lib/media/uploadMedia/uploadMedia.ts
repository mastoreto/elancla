import {
  createUploadBody,
  type MediaFileDto,
  type MediaPurpose,
  mediaFileDto,
  mediaPurposeOf,
  problemSchema,
  uploadTicketDto,
} from "@ancla/contracts";

const API_BASE = "/api";

export type MediaUploadErrorKind =
  /** Checked in the browser, before any request: not an allowed type for the purpose. */
  | "unsupportedType"
  /** Over the purpose's maximum (checked in the browser, or refused by the storage). */
  | "tooLarge"
  /** 403: the role cannot upload this kind of file. */
  | "forbidden"
  /** 422: the server looked at the bytes and they are not what the file claims to be. */
  | "rejected"
  /** The storage refused the PUT, or the network failed. */
  | "uploadFailed"
  | "unknown";

export class MediaUploadError extends Error {
  constructor(
    readonly kind: MediaUploadErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "MediaUploadError";
  }
}

export interface UploadMediaInput {
  file: File;
  purpose: MediaPurpose;
  /** Injected so tests do not need a network; defaults to the global `fetch`. */
  fetchImpl?: typeof fetch;
}

const STATUS_KINDS: Partial<Record<number, MediaUploadErrorKind>> = {
  403: "forbidden",
  413: "tooLarge",
  422: "rejected",
};

async function failureOf(response: Response, step: string): Promise<MediaUploadError> {
  const problem = problemSchema.safeParse(await response.json().catch(() => null));
  const detail = problem.success ? (problem.data.detail ?? problem.data.title) : step;
  return new MediaUploadError(STATUS_KINDS[response.status] ?? "unknown", detail);
}

/** Rejects early what the server would reject anyway, with a reason the UI can show. */
function assertAllowed(file: File, purpose: MediaPurpose): void {
  const definition = mediaPurposeOf(purpose);
  if (!definition.contentTypes.includes(file.type)) {
    throw new MediaUploadError(
      "unsupportedType",
      `File type not allowed: ${file.type || "unknown"}`,
    );
  }
  if (file.size > definition.maxBytes) {
    throw new MediaUploadError("tooLarge", "The file is too large");
  }
}

async function requestTicket(file: File, purpose: MediaPurpose, send: typeof fetch) {
  const body = createUploadBody.parse({
    purpose,
    contentType: file.type,
    size: file.size,
    fileName: file.name,
  });
  const response = await send(`${API_BASE}/media/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await failureOf(response, "The upload could not be requested");
  return uploadTicketDto.parse(await response.json());
}

async function putBytes(
  file: File,
  ticket: { uploadUrl: string; headers: Record<string, string> },
  send: typeof fetch,
) {
  let response: Response;
  try {
    response = await send(ticket.uploadUrl, { method: "PUT", headers: ticket.headers, body: file });
  } catch {
    throw new MediaUploadError("uploadFailed", "The file could not be sent");
  }
  if (!response.ok) {
    throw new MediaUploadError("uploadFailed", "The storage refused the file");
  }
}

/**
 * Uploads a file in three steps (declare, PUT to the quarantine bucket, finalize) and returns the
 * verified file. Every failure is a `MediaUploadError` with a `kind` the UI can translate.
 */
export async function uploadMedia({
  file,
  purpose,
  fetchImpl = fetch,
}: UploadMediaInput): Promise<MediaFileDto> {
  assertAllowed(file, purpose);
  const ticket = await requestTicket(file, purpose, fetchImpl);
  await putBytes(file, ticket, fetchImpl);
  const response = await fetchImpl(`${API_BASE}/media/uploads/${ticket.id}/finalize`, {
    method: "POST",
  });
  if (!response.ok) throw await failureOf(response, "The file could not be verified");
  return mediaFileDto.parse(await response.json());
}
