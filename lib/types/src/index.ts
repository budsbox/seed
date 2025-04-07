export * from '#core';
import { InferObject } from '#object';

/**
 * The general version of InferObject
 */
export type Infer<T> =
  unknown extends T ? T
  : T extends object ? InferObject<T>
  : T;
