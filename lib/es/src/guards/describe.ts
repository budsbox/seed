import type { Predicate } from '@budsbox/lib-types';

const descriptionSymbol = Symbol.for(
  '@budsbox/lib-es/guards#predicateDescription',
);

// eslint-disable-next-line jsdoc/require-jsdoc
export const describeTypePredicate = <TPredicate extends Predicate>(
  predicate: TPredicate,
  typeDescription: string,
): TPredicate => {
  describePredicate(predicate, { type: typeDescription });

  return predicate;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const describePredicate = <TPredicate extends Predicate>(
  predicate: TPredicate,
  conditionOrDescriptor: string | Readonly<PredicateDescriptor>,
): TPredicate => {
  Object.defineProperty(predicate, descriptionSymbol, {
    configurable: true,
    value:
      typeof conditionOrDescriptor === 'string' ?
        ({
          condition: conditionOrDescriptor,
        } as const satisfies PredicateDescriptor)
      : conditionOrDescriptor,
  });

  return predicate;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const describeComplexPredicate = <TPredicate extends Predicate>(
  predicate: TPredicate,
  and: boolean,
  ...subPredicates: readonly Predicate[]
): TPredicate => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const value = {
    [and ? 'and' : 'or']: subPredicates,
  } as Record<'and' | 'or', readonly Predicate[]>;
  describePredicate(predicate, value);

  return predicate;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const getPredicateDescriptor = (
  predicate: Predicate,
): PredicateDescriptor | undefined => {
  if (Object.hasOwn(predicate, descriptionSymbol))
    return predicate[descriptionSymbol as never];

  return;
};

/**
 * Represents a descriptor for a predicate.
 */
export type PredicateDescriptor =
  | { and: readonly Predicate[] }
  | { condition: string }
  | { or: readonly Predicate[] }
  | { type: string };
