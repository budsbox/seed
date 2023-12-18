import type { Def, Undef, Nil, Sure } from './types';

export function isUndef(value: unknown): value is Undef {
  return value === undefined;
}

export function isDef<U>(value: U): value is Def<U>;

export function isDef(value: unknown): boolean {
  return value !== undefined;
}

export function isNil(value: unknown): value is Nil {
  return value == null;
}

export function isNotNil<T>(value: T): value is Sure<T> {
  return !isNil(value);
}

export function isTrue(value: unknown): value is true {
  return value === true;
}

export function isFalse(value: unknown): value is false {
  return value === false;
}

export function isTruly(value: unknown): boolean {
  return Boolean(value);
}

export function isFalsy(value: unknown): boolean {
  return !value;
}

export function isObject(value: unknown): value is object {
  return value != null && typeof value === 'object';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return isObject(value) && Object.keys(value).length > 0;
}

export function isArray<T>(value: T | readonly T[]): value is readonly T[];
export function isArray<T>(value: T | T[]): value is T[];
export function isArray(value: unknown): value is unknown[];

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}
