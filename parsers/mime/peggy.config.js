export default {
  allowedStartRules: [
    'mimeType',
    'essence',
    'type',
    'subtype',
    'tree',
    'subtypeName',
    'subtypeSuffix',
  ],
  dependencies: {},
  dts: true,
  format: 'es',
  input: 'src/parser.peggy',
  output: 'dist/parser.js',
};
