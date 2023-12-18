import { Maybe } from './types.ts';
import { isNotNil, isObject, isTrue } from './guards.ts';
import { filterBy } from './object.ts';

type ClassNameKey = string | number;

export type ClassNameArg = Maybe<
  ClassNameKey | Record<ClassNameKey, boolean> | ClassNameArg[]
>;

export function className(...classNames: ClassNameArg[]): string {
  return classNames
    .map((v): Maybe<ClassNameKey> => {
      if (Array.isArray(v)) {
        return className(...v);
      }

      if (isObject(v)) {
        return className(...Object.keys(filterBy(v, isTrue)));
      }

      return v;
    })
    .filter(isNotNil)
    .join(' ');
}
