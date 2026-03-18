/* eslint-disable import-x/first */
declare const console: { log: (...args: readonly unknown[]) => void };

// #region main
import {
  getParameter,
  normalize,
  parse,
  removeParameter,
  serialize,
  setParameter,
  update,
} from '@budsbox/lib-mime';

// Parse a MIME type string into a structured record
const parsed = parse('text/html; charset=UTF-8');
console.log(parsed.type); // 'text'
console.log(parsed.parameters.get('charset')); // 'utf-8' (normalized)

// Normalize: clean up mixed case and whitespace
const clean = normalize('Text/HTML ; Charset = UTF-8');
console.log(clean); // 'text/html;charset=utf-8'

// Get a specific parameter value
const charset = getParameter('application/json; charset=utf-8', 'charset');
console.log(charset); // 'utf-8'

// Set or update a parameter
const withParam = setParameter('image/png', 'quality', '85');
console.log(withParam); // 'image/png;quality=85'

// Remove a parameter
const cleaned = removeParameter('text/plain; charset=utf-8', 'charset');
console.log(cleaned); // 'text/plain'

// Update the type, subtype, or essence
const updated = update('application/json', 'type', 'text');
console.log(updated); // 'text/json'

// Serialize a record back to string
const record = parse('video/mp4');
console.log(record); // { type: 'video', subtype: 'mp4', ... }
const str = serialize(record);
console.log(str); // 'video/mp4'

// Chaining example: parse → update parameters → add parameter → serialize
const result = setParameter(
  update('text/plain', 'charset=utf-8'),
  'version',
  '1.0',
);
console.log(result); // 'text/plain;charset=utf-8;version=1.0'

// Working with options: preserve charset case
const withCase = setParameter(
  { mimeType: 'text/html', keepCharsetCase: true },
  'charset',
  'UTF-8',
);
console.log(withCase); // 'text/html;charset=UTF-8'

// #endregion main
