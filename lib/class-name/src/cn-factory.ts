import type { ClassNameFn, ClassNameValue } from './types.js';

import { type ClassValue, clsx } from 'clsx';

import { isArray, isFunction } from '@budsbox/lib-es/guards';

/**
 * Generates a function that evaluates and combines class names or class name functions.
 *
 * @param classes - A readonly array of class name values, which can be strings, undefined,
 * or functions that return class names when provided with arguments.
 * @returns A class name generator function that takes the same arguments as the provided
 * class name functions and returns the combined class names as a single string.
 * @typeParam TArgs - The type of arguments accepted by the class name functions.
 */
export function cnFactory<TArgs extends readonly unknown[] = []>(
  this: void,
  ...classes: ReadonlyArray<ClassNameValue<TArgs>>
): (this: void, ...args: TArgs) => string {
  return (...args) => {
    const queue = [...classes];
    const processed: ClassValue[] = [];

    while (queue.length) {
      const next = queue.shift();
      if (isFunction<ClassNameFn<TArgs>>(next)) {
        queue.unshift(next(...args));
      } else if (isArray(next)) {
        queue.unshift(...next);
      } else {
        processed.push(next);
      }
    }
    return clsx(processed);
  };
}
