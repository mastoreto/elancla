import { AwsClient, AwsV4Signer } from "aws4fetch";
import type {
  FileStorage,
  PresignDownloadOptions,
  PresignedDownload,
  PresignedUpload,
  PresignUploadOptions,
  PutObjectOptions,
  StoredObject,
} from "../types";

const MILLISECONDS_PER_SECOND = 1000;
const MAX_RETRIES = 2;
const NOT_FOUND = 404;

export interface S3StorageConfig {
  /** Where this process talks to the storage. */
  endpoint: string;
  /** Host that the browser sees in presigned URLs; defaults to `endpoint`. */
  presignEndpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

/** Path-style URL (`<endpoint>/<bucket>/<key>`), which every S3-compatible server accepts. */
function objectUrl(endpoint: string, bucket: string, key: string): URL {
  const base = endpoint.replace(/\/+$/, "");
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return new URL(`${base}/${bucket}/${encodedKey}`);
}

/** RFC 6266 attachment header with an RFC 5987 name, safe for any characters. */
function attachmentDisposition(fileName: string): string {
  return `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

async function failure(action: string, response: Response): Promise<Error> {
  const detail = (await response.text().catch(() => "")).slice(0, 200);
  return new Error(`Storage ${action} failed (${response.status}): ${detail}`);
}

/**
 * The only storage adapter: any S3-compatible server (SeaweedFS locally, Backblaze B2 in
 * production) through `aws4fetch`, which is plain `fetch` + SigV4 and runs on Node and on Bun.
 */
export function createS3Storage(config: S3StorageConfig): FileStorage {
  const { endpoint, bucket, region, accessKeyId, secretAccessKey } = config;
  const presignEndpoint = config.presignEndpoint ?? endpoint;
  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region,
    retries: MAX_RETRIES,
  });

  async function presign(
    method: "PUT" | "GET",
    url: URL,
    headers: Record<string, string>,
    expiresInSeconds: number,
  ): Promise<string> {
    url.searchParams.set("X-Amz-Expires", String(expiresInSeconds));
    const signer = new AwsV4Signer({
      method,
      url: url.toString(),
      headers,
      accessKeyId,
      secretAccessKey,
      service: "s3",
      region,
      signQuery: true,
      // `Content-Type` and `Content-Length` are unsignable by default; signing them is what makes
      // the storage reject a PUT that is not the file that was declared.
      allHeaders: true,
    });
    return (await signer.sign()).url.toString();
  }

  return {
    async presignUpload(
      options: PresignUploadOptions,
    ): Promise<PresignedUpload> {
      const url = await presign(
        "PUT",
        objectUrl(presignEndpoint, bucket, options.key),
        {
          "content-type": options.contentType,
          "content-length": String(options.size),
        },
        options.expiresInSeconds,
      );
      return {
        url,
        headers: { "Content-Type": options.contentType },
        expiresAt: new Date(
          Date.now() + options.expiresInSeconds * MILLISECONDS_PER_SECOND,
        ),
      };
    },

    async presignDownload(
      options: PresignDownloadOptions,
    ): Promise<PresignedDownload> {
      const target = objectUrl(presignEndpoint, bucket, options.key);
      target.searchParams.set(
        "response-content-disposition",
        attachmentDisposition(options.fileName),
      );
      return {
        url: await presign("GET", target, {}, options.expiresInSeconds),
        expiresAt: new Date(
          Date.now() + options.expiresInSeconds * MILLISECONDS_PER_SECOND,
        ),
      };
    },

    async head(key: string): Promise<StoredObject | null> {
      const response = await client.fetch(objectUrl(endpoint, bucket, key), {
        method: "HEAD",
      });
      if (response.status === NOT_FOUND) return null;
      if (!response.ok) throw await failure("head", response);
      return {
        size: Number(response.headers.get("content-length") ?? 0),
        contentType: response.headers.get("content-type"),
      };
    },

    async get(key: string): Promise<Uint8Array<ArrayBuffer>> {
      const response = await client.fetch(objectUrl(endpoint, bucket, key));
      if (!response.ok) throw await failure("get", response);
      return new Uint8Array(await response.arrayBuffer());
    },

    async put({
      key,
      body,
      contentType,
      cacheControl,
    }: PutObjectOptions): Promise<void> {
      const response = await client.fetch(objectUrl(endpoint, bucket, key), {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          ...(cacheControl ? { "Cache-Control": cacheControl } : {}),
        },
        body,
      });
      if (!response.ok) throw await failure("put", response);
    },

    async delete(key: string): Promise<void> {
      const response = await client.fetch(objectUrl(endpoint, bucket, key), {
        method: "DELETE",
      });
      if (!(response.ok || response.status === NOT_FOUND)) {
        throw await failure("delete", response);
      }
    },
  };
}
