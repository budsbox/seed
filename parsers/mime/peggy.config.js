export default {
  allowedStartRules: [
    'looseMimeType',
    'validMimeType',
    'essence',
    'type',
    'subtype',
    'subtypeName',
    'subtypeSuffix',
  ],
  dependencies: {},
  dts: true,
  format: 'es',
  input: 'src/parser.peggy',
  output: 'dist/parser.js',
  returnTypes: {},
  test: true,
  testFile: 'src/.test.txt',
};
