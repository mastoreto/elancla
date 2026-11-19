export interface StoredObject {
  size: number;
  contentType: string | null;
}

export interface PresignUploadOptions {
  key: string;
  /** Signed into the URL: the storage rejects a PUT that sends another type. */
  contentType: string;
  /** Signed into the URL: the storage rejects a PUT whose body has another length. */
  size: number;
  expiresInSeconds: number;
}

export interface PresignedUpload {
  url: string;
  /** Headers the client must send verbatim (the browser adds `Content-Length` itself). */
  headers: Record<string, string>;
  expiresAt: Date;
}

export interface PresignDownloadOptions {
  key: string;
  expiresInSeconds: number;
  /** Served as an attachment with this name, never rendered inline from our domain. */
  fileName: string;
}

export interface PresignedDownload {
  url: string;
  expiresAt: Date;
}

export interface PutObjectOptions {
  key: string;
  body: Uint8Array;
  contentType: string;
}

/**
 * One bucket. There is no bucket parameter on purpose: each bucket has its own instance and its
 * own credentials (Backblaze B2 restricts a key to a single bucket).
 */
export interface FileStorage {
  presignUpload(options: PresignUploadOptions): Promise<PresignedUpload>;
  presignDownload(options: PresignDownloadOptions): Promise<PresignedDownload>;
  /** `null` when the object does not exist. */
  head(key: string): Promise<StoredObject | null>;
  get(key: string): Promise<Uint8Array<ArrayBuffer>>;
  put(options: PutObjectOptions): Promise<void>;
  /** Deleting a missing object is not an error. */
  delete(key: string): Promise<void>;
}

export type StorageVisibility = "public" | "private";
