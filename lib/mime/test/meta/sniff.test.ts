import { expect, describe, test } from 'vitest';
import groupsTestData from '@budsbox/gen-mime-sniff-test-data/groups' with { type: 'json' };
import minimizedTestData from '@budsbox/gen-mime-sniff-test-data/minimized' with { type: 'json' };
import handCraftedTestData from '@budsbox/gen-mime-sniff-test-data/hand-crafted' with { type: 'json' };

import { minimize, sniffMimeGroups } from '#meta/sniff';

describe.concurrent('minimize', () => {
  describe('mime-types-minimized.json (positive cases)', () => {
    test.for(
      minimizedTestData
        // `minimize(type)` supports all the types (because it doesn't attach any semantic meaning to them)
        // so it returns as-is all the unknown types, and an empty string case never happens.
        .filter(({ output }) => output !== '')
        .map(({ input, output }) => [input, output] as const),
    )('minimizes correctly %s', ([input, output]) =>
      expect(minimize(input)).toBe(output),
    );
  });

  describe('mime-types.json (positive cases)', () => {
    test.for(
      handCraftedTestData
        // `minimize(type)` supports all the types (because it doesn't attach any semantic meaning to them)
        // so it returns as-is all the unknown types, and an empty string case never happens.
        .filter(({ minimizedMIMEType }) => minimizedMIMEType !== '')
        .map(
          ({ input, minimizedMIMEType }) => [input, minimizedMIMEType] as const,
        ),
    )('minimizes %s correctly', ([input, minimizedMIMEType]) => {
      expect(minimize(input)).toBe(minimizedMIMEType);
    });
  });
});

describe.concurrent('sniffMimeGroups', () => {
  describe('mime-groups.json', () => {
    test.for(
      groupsTestData.map(({ input, groups }) => [input, groups] as const),
    )('classifies %s correctly', ([input, groups]) => {
      expect(sniffMimeGroups(input)).toStrictEqual(
        new Set(groups.map((s) => s.toLowerCase())),
      );
    });
  });
});
