/**
 * Whether the request says it carries a body: a length, a chunked transfer or a media type.
 * `Request.body` cannot tell: behind Next a body-less request (a browser `DELETE`) still has a
 * stream, and reading or cloning that request breaks under Next. HTTP/1.1 needs `Content-Length`
 * or `Transfer-Encoding` to send a body, and every browser body (forms included) has a media type;
 * the media type also covers in-process callers, whose requests carry no length.
 */
export function declaresBody(headers: Headers): boolean {
  const contentLength = headers.get("content-length");
  if (contentLength !== null) return contentLength !== "0";
  return headers.has("transfer-encoding") || headers.has("content-type");
}
