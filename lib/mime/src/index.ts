/**
 * This module is the main entry point for the package
 * and provides a comprehensive API for parsing, updating, and serializing MIME types.
 * It accepts flexible input formats (strings, objects, or {@link MimeTypeRecord records}) and
 * normalizes them internally while preserving the original input shape in the output.
 *
 * Key features:
 * - {@link .!parse Parse} MIME type strings into structured records
 * - {@link .!update Update} individual components (type, subtype, essence, parameters)
 * - {@link .!getParameter Get}, {@link .!setParameter set}, {@link .!removeParameter remove} individual parameters
 * - {@link .!serialize Serialize} and {@link .!normalize normalize} MIME types.
 * - Flexible {@link !.MimeTypeInput input}/{@link .!OutputType output} formats with automatic shape preservation
 *
 * ### Quick Start Guide
 * {@includeCode ./quick-start.ts#main}
 *
 * @module .
 * @importTarget .
 * @showCategories
 */

// Type exports
export type * from './types.js';

// Value exports
export {
  getParameter,
  normalize,
  parse,
  removeParameter,
  serialize,
  setParameter,
  update,
} from './lib.js';
