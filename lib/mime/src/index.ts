/**
 * @module High-level MIME type manipulation library.
 *
 * This module provides a comprehensive API for parsing, updating, and serializing MIME types.
 * It accepts flexible input formats (strings, objects, or {@link MimeTypeRecord records}) and
 * normalizes them internally while preserving the original input shape in the output.
 *
 * Key features:
 * - {@link parse Parse} MIME type strings into structured records
 * - {@link update Update} individual components (type, subtype, essence, parameters)
 * - {@link getParameter Get}, {@link setParameter Set}, {@link removeParameter Remove} individual parameters
 * - {@link serialize Serialize} and {@link normalize} MIME types.
 * - Flexible input/output formats with automatic shape preservation
 * @mergeModuleWith <project>
 * @showCategories
 * @importTarget .
 */

import {
  getParameter,
  normalize,
  parse,
  removeParameter,
  serialize,
  setParameter,
  update,
} from './lib.js';

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
};
