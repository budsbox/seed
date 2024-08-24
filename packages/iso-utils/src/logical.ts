import { isDef, isFunction, isNotNil, isTrue } from '#type-guards';
import type { Nil, Sure } from '@budsbox/types';

type FValue<A, T> = T | ((value: A) => T);

export function fif<V, G extends V, T>(
  value: V,
  test: (value: V) => value is G,
  onTrue: FValue<G, T>,
): T | null;
export function fif<V, G extends V, T, F = null>(
  value: V,
  test: (value: V) => value is G,
  onTrue: FValue<G, T>,
  onFalse: FValue<V, F>,
): T | F;
export function fif<V, T, F = null>(
  value: V,
  test: (value: V) => boolean,
  onTrue: FValue<V, T>,
  onFalse: FValue<V, F>,
): T | F | null;

export function fif<V, T, F = null>(
  value: V,
  test: (value: V) => boolean,
  onTrue: FValue<V, T>,
  onFalse?: FValue<V, F> | null,
): T | F | null {
  if (test(value)) {
    const trueFn = isFunction(onTrue) ? onTrue : (): T => onTrue;

    return trueFn(value);
  }

  if (isFunction(onFalse)) {
    return onFalse(value);
  }

  return isDef(onFalse) ? onFalse : null;
}

export function fifs<T, F = null>(
  condition: boolean,
  onTrue: FValue<boolean, T>,
  onFalse?: FValue<boolean, F> | null,
): T | F | null {
  return fif(condition, isTrue, onTrue, onFalse ?? null);
}

export function sure<Value, TrueResult, FalseResult = null>(
  value: Value,
  onTrue: FValue<Sure<Value>, TrueResult>,
  onFalse: FValue<Nil, FalseResult>,
): TrueResult | FalseResult;
export function sure<Value, TrueResult, FalseResult = null>(
  value: Value,
  onTrue: FValue<Sure<Value>, TrueResult>,
  onFalse?: FValue<Nil, FalseResult>,
): TrueResult | FalseResult | null;

export function sure(
  value: unknown,
  onTrue: FValue<Sure<unknown>, unknown>,
  onFalse?: FValue<Nil, unknown>,
): unknown {
  return fif(value, isNotNil, onTrue, onFalse);
}
