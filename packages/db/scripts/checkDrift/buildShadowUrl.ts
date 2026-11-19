const SHADOW_DATABASE_NAME = "ancla_shadow";

/** Same server and credentials as the migration URL, pointing at the throwaway shadow database. */
export function buildShadowUrl(migrationUrl: string): string {
  const url = new URL(migrationUrl);
  url.pathname = `/${SHADOW_DATABASE_NAME}`;
  return url.toString();
}

export function shadowDatabaseName(): string {
  return SHADOW_DATABASE_NAME;
}
