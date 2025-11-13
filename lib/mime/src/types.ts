import type mimeDb from 'mime-db/db.json';
import type { LiteralUnion } from 'type-fest';

import type {
  MimeTypeParsed,
  ParameterName,
  ParameterValue,
  SerializableMimeTypeRecord,
  SerializableParameters,
  SubtypeTokens,
} from '@budsbox/parse-mime';

type MimeDb = typeof mimeDb;

type WellKnownMimeType = keyof MimeDb;

type MimeTypeString = LiteralUnion<string, WellKnownMimeType>;

export interface MimeTypeRecord
  extends Readonly<Omit<MimeTypeParsed, 'parameters' | 'subtypeTokens'>> {
  readonly parameters: ReadonlyMap<
    ParameterName,
    ParameterValue<'keep-first', true>
  >;
  readonly subtypeTokens: Readonly<SubtypeTokens>;
}

export type MimeTypeInput = MimeTypeString | SerializableMimeTypeRecord<true>;

export type UpdatableKey = Extract<
  keyof MimeTypeRecord,
  'essence' | 'subtype' | 'type'
>;

export type ParametersUpdateInput = string | SerializableParameters<true>;
