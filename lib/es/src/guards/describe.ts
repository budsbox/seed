import type { Predicate, TypePredicate } from '@budsbox/lib-types';

const descriptionSymbol = Symbol.for(
  '@budsbox/lib-es/guards#predicateDescription',
);

// eslint-disable-next-line jsdoc/require-jsdoc
export const describeTypePredicate = <TGuard extends TypePredicate>(
  typeGuard: TGuard,
  typeDescription: string,
): TGuard => {
  Object.defineProperty(typeGuard, descriptionSymbol, {
    configurable: true,
    value: { type: typeDescription } as const satisfies PredicateDescriptor,
  });

  return typeGuard;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const describePredicate = <TPredicate extends Predicate>(
  predicate: TPredicate,
  conditionDescription: string,
): TPredicate => {
  Object.defineProperty(predicate, descriptionSymbol, {
    configurable: true,
    value: {
      condition: conditionDescription,
    } as const satisfies PredicateDescriptor,
  });

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
 * Represents a descriptor for a predicate, which can be either described by a condition or a type.
 */
export type PredicateDescriptor = { condition: string } | { type: string };
