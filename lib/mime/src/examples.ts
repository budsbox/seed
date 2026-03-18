/**
 * Examples for MIME type library functions
 *
 * This file contains practical examples demonstrating the usage of all exported functions
 * from the MIME type manipulation library.
 */

import {
  getParameter,
  normalize,
  normalizeInput,
  parse,
  produceOutput,
  removeParameter,
  serialize,
  setParameter,
  update,
} from './lib.js';

declare const console: { log: (...args: readonly unknown[]) => void };

// #region parse
// Example 1: Basic MIME type parsing

const parsed1 = parse('application/json');
console.log(parsed1.type); // 'application'
console.log(parsed1.subtype); // 'json'
console.log(parsed1.essence); // 'application/json'

// Example 2: Parse MIME type with parameters
const parsed2 = parse('text/html; charset=UTF-8');
console.log(parsed2.parameters.get('charset')); // 'utf-8'

// Example 3: Parse with options object
const parsed3 = parse({
  mimeType: 'text/html; Charset=UTF-8',
  keepCharsetCase: true,
});
console.log(parsed3.parameters.get('charset')); // 'UTF-8'

// Example 4: Parse complex MIME type with multiple parameters
const parsed4 = parse(
  'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW; charset=utf-8',
);
console.log(parsed4.parameters.get('boundary')); // '----WebKitFormBoundary7MA4YWxkTrZu0gW'
console.log(parsed4.parameters.get('charset')); // 'utf-8'

// Example 5: Parse from serializable object
const parsed5 = parse({
  type: 'image',
  subtype: 'png',
  parameters: { quality: '85' },
});
console.log(parsed5.essence); // 'image/png'
console.log(parsed5.parameters.get('quality')); // '85'

// Example 6: Parse with multi-parameter handling
const parsed6 = parse({
  mimeType: 'text/plain; charset=utf-8; charset=iso-8859-1',
  multiParameter: 'keep-first',
});
console.log(parsed6.parameters.get('charset')); // 'utf-8'

// #endregion parse

// #region update.full

// Example 1: Update top-level type
const updated1 = update('application/json', 'type', 'text');
console.log(updated1); // 'text/json'

// Example 2: Update subtype
const updated2 = update('text/plain', 'subtype', 'html');
console.log(updated2); // 'text/html'

// Example 3: Update essence (both type and subtype)
const updated3 = update('application/json', 'essence', 'image/png');
console.log(updated3); // 'image/png'

// Example 4: Update parameters using string
const updated4 = update(
  'text/html',
  'parameters',
  'charset=utf-8; boundary=test',
);
console.log(updated4); // 'text/html;charset=utf-8;boundary=test'

// #endregion update.full

// #region update.short

// Example 5: Update parameters using shorthand (without key)
const updated5 = update('application/xml', 'version=1.0');
console.log(updated5); // 'application/xml;version=1.0'

// Example 6: Update parameters on parsed record
const record = parse({ mimeType: 'text/plain', serialize: false });
const updated6 = update(record, 'parameters', { charset: 'iso-8859-1' });
console.log(updated6.parameters.get('charset')); // 'iso-8859-1'

// Example 7: Update with serialize option
const updated7 = update(
  { mimeType: 'image/jpeg', serialize: true },
  { quality: '90' },
);
console.log(typeof updated7); // 'string'
console.log(updated7); // 'image/jpeg;quality=90'

// #endregion update.short

// #region getParameter
// Examples for the getParameter() function

// Example 1: Get existing parameter from string
const param1 = getParameter('text/html; charset=utf-8', 'charset');
console.log(param1); // 'utf-8'

// Example 2: Get parameter with case normalization
const param2 = getParameter('text/html; charset=UTF-8', 'charset');
console.log(param2); // 'utf-8' (normalized to lowercase)

// Example 3: Get parameter preserving case
const param3 = getParameter(
  { mimeType: 'text/html; charset=UTF-8', keepCharsetCase: true },
  'charset',
);
console.log(param3); // 'UTF-8'

// Example 4: Get non-existent parameter (returns null)
const param4 = getParameter('application/json', 'charset');
console.log(param4); // null

// Example 5: Get parameter with throwIfMissing option
try {
  getParameter('image/png', 'quality', true);
} catch (error: unknown) {
  if (error instanceof TypeError) console.log(error.message); // 'Parameter "quality" is not found in MIME type "image/png"'
}

// Example 6: Get parameter from parsed record
const recordForParam = parse({
  mimeType: 'application/json; q=0.8',
  serialize: false,
});
const param6 = getParameter(recordForParam, 'q');
console.log(param6); // '0.8'

// #endregion getParameter

// #region setParameter
// Examples for the setParameter() function

// Example 1: Set parameter on simple MIME type
const withParam1 = setParameter('text/html', 'charset', 'utf-8');
console.log(withParam1); // 'text/html;charset=utf-8'

// Example 2: Set parameter with case preservation
const withParam2 = setParameter(
  { mimeType: 'text/html', keepCharsetCase: true },
  'charset',
  'UTF-8',
);
console.log(withParam2); // 'text/html;charset=UTF-8'

// Example 3: Replace existing parameter
const withParam3 = setParameter(
  'text/html; charset=iso-8859-1',
  'charset',
  'utf-8',
);
console.log(withParam3); // 'text/html;charset=utf-8'

// Example 4: Set parameter with number value
const withParam4 = setParameter('application/json', 'q', 0.9);
console.log(withParam4); // 'application/json;q=0.9'

// Example 5: Remove parameter by setting to null
const withParam5 = setParameter('image/png; quality=85', 'quality', null);
console.log(withParam5); // 'image/png'

// Example 6: Remove parameter by setting to empty string
const withParam6 = setParameter('text/plain; charset=utf-8', 'charset', '');
console.log(withParam6); // 'text/plain'

// Example 7: Set parameter on parsed record
const recordForSet = parse({ mimeType: 'application/json', serialize: false });
const withParam7 = setParameter(recordForSet, 'version', '2.0');
console.log(withParam7.parameters.get('version')); // '2.0'

// #endregion setParameter

// #region removeParameter
// Examples for the removeParameter() function

// Example 1: Remove existing parameter
const removed1 = removeParameter('text/html; charset=utf-8', 'charset');
console.log(removed1); // 'text/html'

// Example 2: Remove parameter from MIME type with multiple parameters
const removed2 = removeParameter(
  'multipart/form-data; boundary=test; charset=utf-8',
  'charset',
);
console.log(removed2); // 'multipart/form-data;boundary=test'

// Example 3: Remove non-existent parameter (no-op)
const removed3 = removeParameter('application/json', 'charset');
console.log(removed3); // 'application/json'

// Example 4: Remove parameter from parsed record
const recordForRemove = parse({
  mimeType: 'image/webp; q=0.8',
  serialize: false,
});
const removed4 = removeParameter(recordForRemove, 'q');
console.log(removed4.parameters.has('q')); // false

// Example 5: Remove parameter with special characters
const removed5 = removeParameter(
  'multipart/form-data; boundary="----WebKitFormBoundary"',
  'boundary',
);
console.log(removed5); // 'multipart/form-data'

// Example 6: Chain parameter removal
const chained = removeParameter(
  removeParameter('text/html; charset=utf-8; version=5', 'charset'),
  'version',
);
console.log(chained); // 'text/html'

// #endregion removeParameter

// #region serialize
// Examples for the serialize() function

// Example 1: Serialize string (returns unchanged)
const serialized1 = serialize('application/json; charset=utf-8');
console.log(serialized1); // 'application/json; charset=utf-8'

// Example 2: Serialize parsed record
const recordForSerialize = parse({
  mimeType: 'text/html; Charset=UTF-8',
  serialize: false,
});
const serialized2 = serialize(recordForSerialize);
console.log(serialized2); // 'text/html;charset=utf-8'

// Example 3: Serialize from object with mimeType property
const serialized3 = serialize({
  mimeType: 'image/png',
  keepCharsetCase: true,
});
console.log(serialized3); // 'image/png'

// Example 4: Serialize serializable object
const serialized4 = serialize({
  type: 'video',
  subtype: 'mp4',
  parameters: { codecs: 'avc1.42E01E' },
});
console.log(serialized4); // 'video/mp4;codecs=avc1.42E01E'

// Example 5: Serialize complex MIME type with multiple parameters
const complexRecord = parse(
  'text/html; charset=utf-8; boundary=test; version=1.0',
);
const serialized5 = serialize(complexRecord);
console.log(serialized5); // 'text/html;charset=utf-8;boundary=test;version=1.0'

// #endregion serialize

// #region normalize
// Examples for the normalize() function

// Example 1: Normalize MIME type with mixed case
const normalized1 = normalize('Text/HTML; Charset=UTF-8');
console.log(normalized1); // 'text/html;charset=utf-8'

// Example 2: Normalize MIME type with extra whitespace
const normalized2 = normalize('application/json ; charset = utf-8');
console.log(normalized2); // 'application/json;charset=utf-8'

// Example 3: Normalize from serializable object
const normalized3 = normalize({
  type: 'IMAGE',
  subtype: 'PNG',
});
console.log(normalized3); // 'image/png'

// Example 4: Normalize MIME type essence only
const normalized4 = normalize('Application/XML');
console.log(normalized4); // 'application/xml'

// Example 5: Normalize complex MIME type
const normalized5 = normalize(
  'MultiPart/Form-Data; BOUNDARY=test; Charset=ISO-8859-1',
);
console.log(normalized5); // 'multipart/form-data;boundary=test;charset=iso-8859-1'

// Example 6: Normalize with object input and parameters
const normalized6 = normalize({
  type: 'TEXT',
  subtype: 'PLAIN',
  parameters: { Charset: 'UTF-8' },
});
console.log(normalized6); // 'text/plain;charset=utf-8'

// #endregion normalize

// #region normalizeInput
// Examples for the normalizeInput() helper function

// Example 1: Normalize string input
const [record1] = normalizeInput('application/json');
console.log(record1.type); // 'application'
console.log(record1.subtype); // 'json'

// Example 2: Normalize object with mimeType
const [record2, options2] = normalizeInput({
  mimeType: 'text/html; charset=UTF-8',
  keepCharsetCase: true,
});
console.log(record2.parameters.get('charset')); // 'UTF-8'
console.log(options2.keepCharsetCase); // true

// Example 3: Normalize already-parsed record (no re-parse)
const existing = parse('image/png');
const [record3] = normalizeInput(existing);
console.log(record3 === existing); // true (same reference)

// Example 4: Normalize serializable object
const [record4] = normalizeInput({
  type: 'video',
  subtype: 'webm',
  parameters: { codecs: 'vp9' },
});
console.log(record4.essence); // 'video/webm'

// Example 5: Normalize with multiple options
const [, options5] = normalizeInput({
  mimeType: 'audio/mpeg; charset=UTF-8',
  keepCharsetCase: true,
  multiParameter: 'list',
});
console.log(options5.multiParameter);

// #endregion normalizeInput

// #region produceOutput
// Examples for the produceOutput() helper function

// Example 1: Produce string output from string input
const output1 = produceOutput('application/json', parse('text/html'));
console.log(typeof output1); // 'string'
console.log(output1); // 'text/html'

// Example 2: Produce record output from object without serialize
const output2 = produceOutput(
  { mimeType: 'image/png', serialize: false },
  parse('image/jpeg'),
);
console.log(typeof output2); // 'object'
console.log(output2.essence); // 'image/jpeg'

// Example 3: Produce string output with serialize: true
const output3 = produceOutput(
  { mimeType: 'text/plain', serialize: true },
  parse('text/html'),
);
console.log(typeof output3); // 'string'
console.log(output3); // 'text/html'

// Example 4: Produce output preserving mimeType input structure
const output4 = produceOutput(
  { mimeType: 'application/xml' },
  parse('application/json'),
);
console.log(typeof output4); // 'string'

// Example 5: Produce frozen record output
const output5 = produceOutput(
  { type: 'video', subtype: 'mp4', serialize: false },
  parse('video/webm'),
);
console.log(Object.isFrozen(output5)); // true

// #endregion produceOutput
