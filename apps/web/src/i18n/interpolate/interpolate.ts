const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Fills `{name}` placeholders. A key that is not in `values` stays visible as `{name}`, so a
 * missing value shows up in review instead of silently disappearing.
 */
export function interpolate(
  template: string,
  values: Readonly<Record<string, string>>
): string {
  return template.replace(PLACEHOLDER, (placeholder, key: string) =>
    Object.hasOwn(values, key) ? (values[key] as string) : placeholder
  );
}

/** `interpolate` applied to every string inside an object tree (messages, content pages). */
export function interpolateDeep<T>(
  value: T,
  values: Readonly<Record<string, string>>
): T {
  if (typeof value === 'string') return interpolate(value, values) as T;
  if (Array.isArray(value))
    return value.map((item) => interpolateDeep(item, values)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        interpolateDeep(item, values),
      ])
    ) as T;
  }
  return value;
}
