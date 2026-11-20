// ponytail: short list on purpose; a bot that lies about its user agent is not worth chasing.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|headless|lighthouse|curl|wget|python-requests|httpclient|go-http-client/i;

/** An empty user agent counts as a bot: a real browser always sends one. */
export function isKnownBot(userAgent: string): boolean {
  const trimmed = userAgent.trim();
  return trimmed === "" || BOT_PATTERN.test(trimmed);
}
