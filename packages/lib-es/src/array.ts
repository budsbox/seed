export function ensureArray<T>(value: T | readonly T[]): readonly T[];
export function ensureArray<T>(value: T | T[]): T[];
export function ensureArray(value: unknown): unknown[] {
  return Array.isArray(value) ? (value as unknown[]) : [value];
}

export const dedupe = <T>(items: readonly T[]): T[] =>
  Array.from(new Set(items));
