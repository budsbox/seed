import type { Maybe } from '@budsbox/types';

import { filterBy } from '#object';
import { isNotNil, isObject, isTrue } from '#type-guards';

type ClassNameKey = string | number;

export type ClassNameArg = Maybe<
  | ClassNameKey
  | Readonly<Record<ClassNameKey, boolean>>
  | readonly ClassNameArg[]
>;

export function className(...classNames: readonly ClassNameArg[]): string {
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

export function parsePackageName(packageName: string): {
  ns: `@${string}/` | null;
  name: string;
} {
  const [ns] = (/^@[^/]+\//.exec(packageName) as [`@${string}/`] | null) ?? [
    null,
  ];
  return {
    ns,
    name: packageName.replace(ns ?? '', ''),
  };
}
