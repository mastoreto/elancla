const ONE_YEAR_IN_SECONDS = 31_536_000;
const HSTS_MAX_AGE = ONE_YEAR_IN_SECONDS * 2;
const GOOGLE_AVATAR_ORIGIN = "https://lh3.googleusercontent.com";
const ASSEMBLY_REPORT_PATH_PREFIX = "/informe";
/** Features the CRM never uses; denied everywhere. Geolocation is re-enabled only for /informe. */
const DENIED_FEATURES = [
  "accelerometer",
  "camera",
  "display-capture",
  "gyroscope",
  "magnetometer",
  "microphone",
  "payment",
  "usb",
] as const;

interface SecurityHeadersInput {
  nonce: string;
  pathname: string;
  isDevelopment: boolean;
  /** Origin the browser PUTs uploads to (the storage), from the environment. */
  uploadOrigin?: string;
  /** Origin the public media variants are served from (the CDN), from the environment. */
  mediaOrigin?: string;
}

function buildContentSecurityPolicy({
  nonce,
  isDevelopment,
  uploadOrigin,
  mediaOrigin,
}: Pick<SecurityHeadersInput, "nonce" | "isDevelopment" | "uploadOrigin" | "mediaOrigin">): string {
  const imageSources = ["'self'", "blob:", "data:", GOOGLE_AVATAR_ORIGIN];
  if (mediaOrigin) imageSources.push(mediaOrigin);
  const connectSources = ["'self'"];
  if (uploadOrigin) connectSources.push(uploadOrigin);
  const directives = [
    "default-src 'self'",
    // 'strict-dynamic' lets the nonce'd bootstrap load Next's chunks; React dev needs eval.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    // Radix UI positions popovers with inline styles, so styles cannot be nonce-only.
    "style-src 'self' 'unsafe-inline'",
    // Google profile pictures stay remote (copying them to our storage is out of scope for 0.6),
    // plus the public media origin.
    `img-src ${imageSources.join(" ")}`,
    "font-src 'self'",
    `connect-src ${connectSources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (!isDevelopment) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

function buildPermissionsPolicy(pathname: string): string {
  const allowsGeolocation =
    pathname === ASSEMBLY_REPORT_PATH_PREFIX ||
    pathname.startsWith(`${ASSEMBLY_REPORT_PATH_PREFIX}/`);
  const features = DENIED_FEATURES.map((feature) => `${feature}=()`);
  features.push(allowsGeolocation ? "geolocation=(self)" : "geolocation=()");
  return features.join(", ");
}

/** Security headers for a CRM page response (the API sets its own). See security.md section 4. */
export function buildSecurityHeaders(input: SecurityHeadersInput): Record<string, string> {
  return {
    "Content-Security-Policy": buildContentSecurityPolicy(input),
    "Strict-Transport-Security": `max-age=${HSTS_MAX_AGE}; includeSubDomains; preload`,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": buildPermissionsPolicy(input.pathname),
    "Cross-Origin-Opener-Policy": "same-origin",
    "X-Robots-Tag": "noindex",
  };
}
